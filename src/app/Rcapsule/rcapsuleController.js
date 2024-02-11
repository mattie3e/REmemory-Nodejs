import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { 
	readNumnUrl_s, 
	readDear_s, 
	createText_s,
	postRcapsule,
	setPassword_s,
	addVoiceLetter_s,
 } from "./rcapsuleService.js";

import { getUserInfos } from "../User/userProvider.js";
// import { Url } from "url"

//-> winnie part

/**
 * API Name : 캡슐번호, 롤링페이퍼 url 받기
 * [GET] : /rcapsule/info/:rcapsule_id
 * capsule_number, capsule_url
 */
export const readNumNUrl_c = async (req, res, next) => {
	try {
		//데이터 베이스에서 정보 조회
		const capsuleNumber = req.body.capsule_number;
		const capsuleUrl = req.body.url;

		const data = await readNumnUrl_s(capsuleNumber);

		//받은 정보를 응답으로 -> response에 넣기
		res.send(
			response(status.SUCCESS, {
				numNUrl: data,
			}),
		);
	} catch (error) {
		//에러 처리
		next(error);
		console.log(error);
	}
};

/**
 * API NAME : url 들어왔을 시 화면
 * dearName 과 rcapsule_id 반환
 * [GET] : /:rcapsule_number/:rCapsuleCnt
 */
export const readDear_c = async (req, res, next) => {
	try {
		const capsuleNumber = req.body.capsule_number;

		const data = await readDear_s(capsuleNumber);

		res.send(
			response(status.SUCCESS, {
				dearNid: data,
			}),
		);
	} catch (error) {
		next(error);
		console.log(error);
	}
};

/**
 * API NAME : 확인했어요! -> 글&사진 열기
 * [POST] : /rcapsule_number/text_photo
 */
export const createText_c = async (req, res, next) => {
	//body : from_name, content_type, image_url, body
	// params인지 body인지 햇갈리는데 차이는?!
	try {
		//aws s3에 업로드 된 파일 url 접근 및 db 저장
		//console.log(req.file.locatiron); // aws s3에 올려진 파일 url

		const { from_name, content_type, image_url, body } = req.body;

		//형식적 validation 처리 *이 부분 추가 수정하기
		if (!req.params.rcapsule_number) {
			return res.send(response(status.BAD_REQUEST));
		}
		if (!from_name) {
			return res.send(response(status.NOT_FOUND));
		} else if (!content_type) {
			return res.send(response(status.NOT_FOUND));
		} else if (!image_url && !body) {
			return res.send(response(status.NOT_FOUND));
		}
		//처리 결과를 클라이언트에게 응답
		const result = await createText_s(
			req.file.location,
			req.params.rcapsule_number,
			req.body,
		);

		res.send(
			response(status.SUCCESS, {
				...req.body, // 원래의 데이터 복사
				capsule_number: result.capsuleNumber,
			}),
		);
	} catch (error) {
		// * 추가
		res.send(status.INTERNAL_SERVER_ERROR, {
			error: "텍스트 및 사진 파일 업로드 실패.",
			detail: error,
		});
		next(error);
		console.log(error);
	}
};

//-> nahy part

// API Name : 롤링페이퍼(rcapsule) 생성 API
// [POST] /rcapsule/create
export const createRcapsule = async (req, res, next) => {
	//body : rcapsule_name, open_date, dear_name, theme(제외)
	try {
		// const userId = req.user ? req.user.userId : null; //userId를 어떻게 가져올 수 있을까..?

		console.log(req.url);
		// const paramsRegex = /userId=(.*?)/; //swagger 테스트용 임시
		// const [, userId] = paramsRegex.exec(req.url);
		// console.log('userID : ', userId);
		const paramsRegex = /[?&]userId=([^&]+)/;
		const match = paramsRegex.exec(req.url);
		const userId = match && decodeURIComponent(match[1]);
		console.log('userID : ', userId);

		if (!userId) {
			return res.send(
				response(status.EMPTY_TOKEN, { err: "유저 정보가 없습니다." }),
			); // 또는 로그인 페이지로 리다이렉트 등의 처리
		}

		const userInfos = await getUserInfos(userId);
		console.log('userInfos : ', userInfos);
		const nickname = userInfos.nickname; // userInfos -> 이거 userInfo 함수 없어져서 수정 필요 *****

        const data = await postRcapsule(req.body, nickname, userId);
        res.send(
            response(status.SUCCESS, {
                // ...data,
                capsule_number: data.capsule_number,
                rcapsule_id: data.newRcapsuleId,
            })
        );
    } catch (error) {
        // next(e);//보류
		console.log(error);
        if (error instanceof BaseError) {
            // BaseError를 캐치한 경우
            next(error);
        } 
        else if(error.message.includes("Missing required field")) {
            // 필수 필드가 누락된 경우의 오류 처리
            res.send(response(status.BAD_REQUEST, error.message));
        }
        else {
            // 그 외의 오류 처리
            console.error("Error creating rcapsule:", error);
            res.status(500).send("Internal Server Error");
        }
    }
};


// API Name : 롤링페이퍼(rcapsule) 비밀번호 설정 API
// [PATCH] /rcapsule/:rcapsule_id
export const setRcapsulePw = async (req, res, next) => {
    // body: rcapsule_password
    const rcapsule_id = req.params.rcapsule_id;
	console.log('rcapsuleController.js, req.params.rcapsule_id', rcapsule_id);
	console.log('req.body! : \n', req.body);

    try {
        if (!rcapsule_id) {
            return res.send(response(status.BAD_REQUEST), { error: "rcapsule_id가 없습니다." });
        }

        const result = await setPassword_s(req.body, rcapsule_id);
		// console.log('rcapsuleController.js, result: ', result);
        res.send(result);
    } catch (error) {
		console.log(error.data);
		if (error.data.status == 400) {
			res.send(response(status.BAD_REQUEST, {error: "입력된 password가 없습니다."}));
		} else if (error.data.code == 'CAPSULE4001') {
			res.send(response(status.CAPSULE_NOT_FOUND, {error: "존재하지 않는 롤링페이퍼 캡슐입니다."}))
		}
        else {
			res.send(response(status.INTERNAL_SERVER_ERROR, { error: error.message }));
		}
    }
};

// API Name : 롤링페이퍼 음성 편지 쓰기
export const addVoiceLetter_c = async (req, res, next) => {
    // body : from_name, content_type, theme, voice (formdata)
    try {
        // aws s3에 업로드 된 파일 url 접근 및 db 저장
        console.log(req.file.location); // aws s3에 올려진 파일 url
		console.log('req.params.rcapsule_number : ', req.params.rcapsule_number);
		// console.log('req', req.url);

		const paramsRegex = /from_name=(.*?)&content_type=(.*?)&theme=(.*)/;
		const [, fromName, contentType, theme] = paramsRegex.exec(req.url);
		
		const body = {
			"from_name" : fromName,
			"content_type" : contentType,
			"theme" : theme
		};
		console.log('body : ', body);

        if(!req.file.location) {
			console.log('file x')
            // throw error;
			return res.send(response(status.BAD_REQUEST, { err: "파일 업로드 실패."}))
        }

        if(!req.params.rcapsule_number) {
            return res.send(response(status.BAD_REQUEST, { err: "rcapsule_number가 없습니다." }));
        }

        const result = await addVoiceLetter_s(req.file.location, req.params.rcapsule_number, body);
        res.send(result);

    } catch (error) {
        // res.send(status.INTERNAL_SERVER_ERROR, { error: "음성 파일 업로드 실패.", detail: error });
		if (error.data.code == 'CAPSULE4001') {
			res.send(response(status.CAPSULE_NOT_FOUND, {error: "존재하지 않는 롤링페이퍼 캡슐입니다."}))
		} else {
			res.send(response(status.INTERNAL_SERVER_ERROR, {err: "음성 메세지 쓰기 실패", detail: error}));
		}
    }
};