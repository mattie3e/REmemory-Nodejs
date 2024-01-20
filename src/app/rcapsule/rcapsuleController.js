import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { getUserInfos } from "../User/userService.js";

import { postRcapsule } from "./rcapsuleService.js";

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
                ...data,
                capsule_number: data.capsule_number,
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