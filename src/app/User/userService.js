import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";
import { BaseError } from "../../../config/error.js";
import {
	getUserIdByEmail,
	getUserInfo,
	insertUser,
	setUserNickname,
	setUserStatus,
} from "./userDao.js";
import { getUserInfos, getuserStatus, setUserJwt } from "./userProvider.js";

export const userSignAction = async (userCheck, userInfo) => {
	if (userCheck) {
		const userId = await getUserIdByEmail(userInfo.email);
		if (userId == -1) throw new BaseError(status.BAD_REQUEST);
		const tokenInfo = setUserJwt(userId);
		const userData = await getUserInfo(userId);

		if (!userData.status) {
			await changeUserStatus(userId, 1);
		}
		return {
			type: 1,
			data: {
				userId: userData.id,
				email: userData.email,
				gender: userData.gender,
				nickname: userData.nickname,
				...tokenInfo,
			},
		};
	} else {
		const userId = await insertUser(userInfo);
		const userData = await getUserInfos(userId);
		return {
			type: 0,
			data: {
				userId: userData.userId,
				email: userData.email,
				gender: userData.gender,
			},
		};
	}
};

export const setNickname = async (body, newUser) => {
	const { userId, nickname, email } = body;
	const bodyArr = [userId, nickname];

	bodyArr.forEach((value) => {
		if (!value) throw new BaseError(status.BAD_REQUEST);
	});

	const userInfoCheck = await getUserInfos(userId);
	if (newUser) {
		if (!email) throw new BaseError(status.BAD_REQUEST);
		if (userInfoCheck.email != email) throw new BaseError(status.FORBIDDEN);
		if (userInfoCheck.nickname !== null) throw new BaseError(status.FORBIDDEN); // 이미 닉네임이 설정되어있는 경우
	}

	const result = await setUserNickname(userId, nickname);
	if (result == -1) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		const userInfo = await getUserInfos(userId);
		const tokenInfo = setUserJwt(userId);
		if (newUser) {
			return {
				userId: userInfo.userId,
				email: userInfo.email,
				gender: userInfo.gender,
				nickname: userInfo.nickname,
				...tokenInfo,
			};
		} else {
			return {
				userId: userInfo.userId,
				nickname: userInfo.nickname,
			};
		}
	}
};

export const changeUserStatus = async (userId, userStatus) => {
	if (!userId) throw new BaseError(status.BAD_REQUEST);

	const userData = await getuserStatus(userId);
	if (userData.status == userStatus) {
		throw new BaseError(status.CURRENT_STATUS);
	} else {
		const result = await setUserStatus(userId, userStatus);
		if (result == -1) {
			throw new BaseError(status.BAD_REQUEST);
		} else {
			return await getuserStatus(userId);
		}
	}
};
