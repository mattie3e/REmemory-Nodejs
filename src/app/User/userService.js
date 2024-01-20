import jwt from "jsonwebtoken";
import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";
import {
	checkUserEmail,
	getUserIdByEmail,
	getUserInfo,
	setUserNickname,
} from "./UserDao.js";

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

export const KakaoEmailCheck = async (userInfo) => {
	const email = userInfo.email;

	// DB 상에 존재하는 email일 경우 바로 토큰 전달, 아니라면 회원가입 후 전달
	const checkUserData = await checkUserEmail({
		email: email,
	});

	if (checkUserData == -1) {
		const userId = await getUserIdByEmail(email);
		const tokenInfo = setUserJwt(userId);
		const userData = await getUserInfo(userId);
		console.log(userId);
		console.log(userData);
		return response(status.LOGIN_SUCCESS, {
			userId: userId,
			email: userData.email,
			gender: userData.gender,
			nickname: userData.nickname,
			...tokenInfo,
		});
	} else {
		const userData = await getUserInfo(checkUserData);
		return response(status.NICKNAME_REQUIRED, {
			userId: userData.id,
			email: userData.email,
			gender: userData.gender,
		});
	}
};

export const setNickname = async (body, newUser) => {
	const userId = body.userId;
	const nickname = body.nickname;
	const email = body.email;

	if (userId == undefined || nickname == undefined) {
		return response(status.BAD_REQUEST, {});
	}

	const userInfo = await getUserInfo(userId);
	if (userInfo == -1) return response(status.FORBIDDEN, {});
	if (newUser && userInfo.email != email) return response(status.FORBIDDEN, {});

	const result = await setUserNickname(userId, nickname);

	if (result == -1) {
		return response(status.BAD_REQUEST, {});
	} else {
		const userInfo = await getUserInfo(userId);
		const tokenInfo = setUserJwt(userId);
		if (newUser) {
			return response(status.SUCCESS, {
				userId: userInfo.id,
				email: userInfo.email,
				gender: userInfo.gender,
				nickname: userInfo.nickname,
				...tokenInfo,
			});
		} else {
			return response(status.SUCCESS, {
				userId: userInfo.id,
				nickname: userInfo.nickname,
			});
		}
	}
};

export const getUserInfos = async (body) => {
	const userId = body.userId;
	const userInfo = await getUserInfo(userId);
	if (userInfo == -1)
		return response(status.BAD_REQUEST, { err: "잘못된 유저 정보입니다." });
	else {
		return response(status.SUCCESS, {
			userId: userInfo.id,
			email: userInfo.email,
			gender: userInfo.gender,
			nickname: userInfo.nickname,
		});
	}
};
