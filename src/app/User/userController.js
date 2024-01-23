import axios from "axios";
import dotenv from "dotenv";
import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";
import { KakaoEmailCheck, getUserInfos, setNickname } from "./userService.js";

dotenv.config();

export const KakaoGetUserInfo = async (req, res) => {
	const code = req.query.code;
	try {
		const accessTokenResponse = await axios({
			method: "POST",
			url: "https://kauth.kakao.com/oauth/token",
			headers: {
				"content-type": "application/x-www-form-urlencoded;charset=utf-8",
			},
			data: {
				grant_type: "authorization_code",
				client_id: process.env.KAKAO_ID,
				redirect_uri: process.env.KAKA_REDIRECT_URI,
				code: code,
			},
		});
		const accessToken = accessTokenResponse.data.access_token;
		const userInfoResponse = await axios({
			method: "GET",
			url: "https://kapi.kakao.com/v2/user/me",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"content-type": "application/json",
			},
		});
		const userInfo = userInfoResponse.data.kakao_account;
		res.send(await KakaoEmailCheck(userInfo));
	} catch (err) {
		console.log(err);
		res.send(response(status.BAD_REQUEST, err.message));
	}
};

export const userSetNickname = async (req, res) => {
	if (req.user == undefined) {
		res.send(await setNickname(req.body, 1));
	} else {
		if (req.user.userId == req.body.userId) {
			res.send(await setNickname(req.body, 0));
		} else {
			res.send(response(status.FORBIDDEN, {}));
		}
	}
};

export const userGetInfo = async (req, res) => {
	if (req.user.userId != req.body.userId) {
		res.send(response(status.FORBIDDEN, {}));
	} else if (req.user == undefined) {
		res.send(response(status.BAD_REQUEST, { err: "잘못된 유저 정보입니다." }));
	} else {
		res.send(await getUserInfos(req.body));
	}
};
