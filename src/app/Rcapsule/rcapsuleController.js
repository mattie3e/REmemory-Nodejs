import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { getUserInfos } from "../User/userService.js";

import { postRcapsule,
    setPassword_s,
    addVoiceLetter_s } from "./rcapsuleService.js";

// API Name : 롤링페이퍼(rcapsule) 생성 API
// [POST] /rcapsule/create
export const createRcapsule = async (req, res, next) => {
    //body : rcapsule_name, open_date, dear_name, theme
    try {

        const userId = req.user ? req.user.userId : null; //userId를 어떻게 가져올 수 있을까..?

        if (!userId) {
            return res.send(response(status.EMPTY_TOKEN, { err: "유저 정보가 없습니다." })); // 또는 로그인 페이지로 리다이렉트 등의 처리
        }
    
        const userInfos = await getUserInfos({ userId: userId});
        const nickname = userInfos.result.nickname; // userInfos.data.nickname

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

    try {
        if (!rcapsule_id) {
            return res.send(response(status.BAD_REQUEST), { err: "rcapsule_id가 없습니다." });
        }

        const result = await setPassword_s(req.body, rcapsule_id);
        res.send(result);
    } catch (error) {
        res.send(response(status.INTERNAL_SERVER_ERROR, { error: error.message }));
        // next(error);
    }
};

// API Name : 롤링페이퍼 음성 편지 쓰기
export const addVoiceLetter_c = async (req, res, next) => {
    // body : from_name, content_type, theme, voice (formdata)
    try {
        // aws s3에 업로드 된 파일 url 접근 및 db 저장
        // console.log(req.file.location); // aws s3에 올려진 파일 url
        if(!req.file.location) {
            throw error;
        }

        if(!req.params.rcapsule_number) {
            return res.send(response(status.BAD_REQUEST), { err: "rcapsule_number가 없습니다." });
        }

        const result = await addVoiceLetter_s(req.file.location, req.params.rcapsule_number, req.body);
        res.send(result);

    } catch (error) {
        res.send(status.INTERNAL_SERVER_ERROR, { error: "음성 파일 업로드 실패.", detail: error });
    }
};