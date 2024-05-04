import axios from "axios";
import jwt from "jsonwebtoken";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { checkUserEmail, getUserInfo } from "./userDao.js";

export const kakaoGetUserInfo = async (code) => {
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

		return userInfo;
	} catch (err) {
		console.log(err);
		throw new BaseError(status.KAKAO_REJECTION);
	}
};

export const emailCheck = async (userInfo) => {
	const email = userInfo.email;

	const checkUserData = await checkUserEmail({
		email: email,
	});

	return checkUserData;
};

export const getUserInfos = async (userId) => {
	const userInfo = await getUserInfo(userId);

	if (userInfo == -1) throw new BaseError(status.BAD_REQUEST);
	else {
		return {
			userId: userInfo.id,
			email: userInfo.email,
			nickname: userInfo.nickname,
			// 비활성화 알려줄 status 코드 추가
			status: userInfo.status,
		};
	}
};

export const getuserStatus = async (userId) => {
	const userInfo = await getUserInfo(userId);
	if (userInfo == -1) throw new BaseError(status.BAD_REQUEST);
	else {
		return {
			userId: userInfo.id,
			status: userInfo.status,
		};
	}
};

export const setUserJwt = (userId) => {
	const provider = "kakao";
	let token = jwt.sign(
		{
			userId: userId,
			provider: provider,
		},
		process.env.SECRET_KEY,
		{
			expiresIn: "2h",
		},
	);
	return {
		token: token,
		expires: "2h",
	};
};
