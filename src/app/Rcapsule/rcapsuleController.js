import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import {
	readNumnUrl_s,
	readDear_s,
	createText_s,
	postRcapsule,
	setPassword_s,
	addVoiceLetter_s,
	readRcs_s,
	readDetailRcs_s,
	addTextImage_rcs,
	readInnerDetailRcs_s,
} from "./rcapsuleService.js";

import { getUserInfos } from "../User/userProvider.js";
import { StatusCodes } from "http-status-codes";
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
	}
};

/**
 * API NAME : url 들어왔을 시 화면
 * dearName 과 rcapsule_id 반환
 * [GET] : /url_info/{rcapsule_id}
 */
//path : rcapsule_number
export const readDear_c = async (req, res, next) => {
	try {
		const capsuleNumber = req.params.rcapsule_number;

		const data = await readDear_s(capsuleNumber);

		res.send(
			response(status.SUCCESS, {
				data,
			}),
		);
	} catch (error) {
		// next(error);
		if (error.data.status == 404) {
			res.status(404).send(
				response(status.CAPSULE_NOT_FOUND, {
					err: "캡슐을 찾을 수 없습니다. 다시 시도해 주세요.",
				}),
			);
		} else if (error.data.status == 403) {
			res.status(403).send(
				response(status.CAPSULE_NOT_VALID, {
					err: "비밀번호가 없는 캡슐입니다. 비밀번호를 먼저 설정해 주세요.",
				}),
			);
		} else {
			res
				.status(500)
				.send(response(status.INTERNAL_SERVER_ERROR), { detail: error });
		}
	}
};

//-> nahy part

// API Name : 롤링페이퍼(rcapsule) 생성 API
// [POST] /rcapsule/create
export const createRcapsule = async (req, res, next) => {
	//body : rcapsule_name, open_date, dear_name, theme
	try {
		// const userId = req.user ? req.user.userId : null; //userId를 어떻게 가져올 수 있을까..?

		// const paramsRegex = /[?&]userId=([^&]+)/;
		// const match = paramsRegex.exec(req.url);
		// const userId = match && decodeURIComponent(match[1]);

		// const userId = req.query.userId || req.user.userId;
		// 광고 때문에 임시로 수정 user_id 고정
		userId = 10; // test용 user_id

		if (!userId) {
			return res
				.status(401)
				.send(response(status.EMPTY_TOKEN, { err: "유저 정보가 없습니다." }));
		}

		const userInfos = await getUserInfos(userId);

		const nickname = userInfos.nickname; // userInfos -> 이거 userInfo 함수 없어져서 수정 필요 *****

		const data = await postRcapsule(req.body, nickname, userId);

		res.send(
			response(status.SUCCESS, {
				// ...data,
				capsule_number: data.capsule_number,
				rcapsule_id: data.newRcapsuleId,
				url: data.rcapsule_url,
			}),
		);
	} catch (error) {
		// next(e);//보류
		// if (error instanceof BaseError) {
		//    // BaseError를 캐치한 경우
		//    next(error);
		// } else if (error.message.includes("Missing required field")) {
		//    // 필수 필드가 누락된 경우의 오류 처리
		//    res.send(response(status.BAD_REQUEST));
		// } else {
		//    // 그 외의 오류 처리
		//    // console.error("Error creating rcapsule:", error);
		//    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(response(status.INTERNAL_SERVER_ERROR));
		// }

		res
			.status(500)
			.send(response(status.INTERNAL_SERVER_ERROR, { detail: error }));
	}
};

// API Name : 롤링페이퍼(rcapsule) 비밀번호 설정 API
// [PATCH] /rcapsule/:rcapsule_id
export const setRcapsulePw = async (req, res, next) => {
	// body: rcapsule_password
	const rcapsule_id = req.params.rcapsule_id;

	try {
		if (!rcapsule_id) {
			return res.send(response(status.BAD_REQUEST), {
				err: "rcapsule_id가 없습니다.",
			});
		}

		const result = await setPassword_s(req.body, rcapsule_id);

		res.send(result);
	} catch (error) {
		if (error.data.status == 400) {
			res.status(400).send(
				response(status.BAD_REQUEST, {
					error: "입력된 password가 없습니다.",
				}),
			);
		} else if (error.data.code == "CAPSULE4001") {
			res.status(400).send(
				response(status.CAPSULE_NOT_FOUND, {
					error: "존재하지 않는 롤링페이퍼 캡슐입니다.",
				}),
			);
		} else {
			res
				.status(500)
				.send(response(status.INTERNAL_SERVER_ERROR, { error: error.message }));
		}
	}
};

/**
 * API NAME : 확인했어요! -> 글&사진 열기
 * [POST] : /rcapsule_number/text_photo
 */
export const createText_c = async (req, res, next) => {
	//body : from_name, content_type, formData(image, text)
	try {
		//aws s3에 업로드 된 파일 url 접근 및 db 저장
		//console.log(req.file.locatiron); // aws s3에 올려진 파일 url

		const capsule_number = req.body.capsule_number;
		const textImageContent = req.body.contents;
		const align_type = req.body.align_type;
		const from_name = req.body.from_name; // rcapsule 글/사진 쓰기의 경우 이게 필요

		const result = await addTextImage_rcs(
			capsule_number,
			textImageContent,
			align_type,
			from_name,
		);
		res.status(200).send(
			response(status.SUCCESS, {
				result,
			}),
		);
	} catch (error) {
		res.status(500).send(
			response(status.INTERNAL_SERVER_ERROR, {
				err: "글/사진 메세지 쓰기 실패",
				detail: error,
			}),
		);
	}
};

// API Name : 롤링페이퍼 음성 편지 쓰기
export const addVoiceLetter_c = async (req, res, next) => {
	// body : from_name, content_type, voice (formdata)
	try {
		const fromName = req.query.from_name;
		const contentType = req.query.content_type;

		const body = {
			from_name: fromName,
			content_type: contentType,
		};

		if (!req.file.location) {
			// throw error;
			return res
				.status(500)
				.send(
					response(status.INTERNAL_SERVER_ERROR, { err: "파일 업로드 실패." }),
				);
		}

		if (!req.params.rcapsule_number) {
			return res
				.status(400)
				.send(
					response(status.BAD_REQUEST, { err: "rcapsule_number가 없습니다." }),
				);
		}

		const result = await addVoiceLetter_s(
			req.file.location,
			req.params.rcapsule_number,
			body,
		);
		res.send(result);
	} catch (error) {
		// res.send(status.INTERNAL_SERVER_ERROR, { error: "음성 파일 업로드 실패.", detail: error });
		if (error.data.code == "CAPSULE4001") {
			res.status(400).send(
				response(status.CAPSULE_NOT_FOUND, {
					error: "존재하지 않는 롤링페이퍼 캡슐입니다.",
				}),
			);
		} else {
			res.status(500).send(
				response(status.INTERNAL_SERVER_ERROR, {
					err: "음성 메세지 쓰기 실패",
					detail: error,
				}),
			);
		}
	}
};

// rcapsule 조회 코드 추가

// API Name : rcapsule 조회 API
// [GET] /retrieve
// [Get] /capsule/retrieve/detail -> rcapsule part와 연결된 로직임
export const readRcs_c = async (req, res, next) => {
	try {
		const capsuleNumber = req.query.capsule_number;
		const capsulePassword =
			req.query.rcapsule_password || req.query.capsule_password;

		const data = await readRcs_s(capsuleNumber, capsulePassword);

		res.send(
			response(status.SUCCESS, {
				rcapsules: data,
			}),
		);
	} catch (error) {
		next(error);
	}
};

// API Name : rcapsule 상세조회 API
// [GET] /retrieveDetail
export const readDetailRcs_c = async (req, res, next) => {
	try {
		const capsuleNumber = req.query.capsule_number;
		const capsulePassword =
			req.query.rcapsule_password || req.query.capsule_password;
		//   console.log(capsuleNumber, capsulePassword);

		const data = await readDetailRcs_s(capsuleNumber, capsulePassword);

		res.send(
			response(status.SUCCESS, {
				rcapsules: data.rollingPaperList,
				theme: data.theme,
				dear_name: data.dear_name,
				rcapsule_name: data.rcapsule_name,
			}),
		);
	} catch (error) {
		next(error);
	}
};

// API Name : rcapsule 상상세조회 API
// [GET] /retrieveDetail
export const readInnerDetailRcs_c = async (req, res, next) => {
	try {
		const wId = req.query.writer_id;
		if (!wId) {
			res.status(400).send(
				response(status.BAD_REQUEST, {
					err: "writer id undefined",
				}),
			);
		}

		const data = await readInnerDetailRcs_s(wId);

		res.send(
			response(status.SUCCESS, {
				capsuledata: data,
			}),
		);
	} catch (error) {
		next(error);
	}
};
