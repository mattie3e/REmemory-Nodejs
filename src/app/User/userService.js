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
		console.log("userSignAction 함수, userCheck 일 때 시작");
		const userId = await getUserIdByEmail(userInfo.email);
		console.log("userSignAction 함수, userId: ", userId);
		if (userId == -1) throw new BaseError(status.BAD_REQUEST);
		const tokenInfo = setUserJwt(userId);
		console.log("userSignAction 함수, tokenInfo: ", tokenInfo);
		const userData = await getUserInfo(userId);
		console.log("userSignAction 함수, userData: ", userData);
		if (!userData.status) {
			console.log("userData.status != 1일 때");
			await changeUserStatus(userId, 1);
		}

		return {
			type: 1,
			data: {
				userId: userData.id,
				nickname: userData.nickname,
				...tokenInfo,
			},
		};
	} else {
		console.log("userSignAction 함수, userCheck != 때 시작");
		const userId = await insertUser(userInfo);
		console.log("userSignAction 함수, userId: ", userId);
		const tokenInfo = setUserJwt(userId);
		console.log("userSignAction 함수, tokenInfo: ", tokenInfo);
		const userData = await getUserInfos(userId);
		console.log("userSignAction 함수, userData: ", userData);
		return {
			type: 0,
			data: {
				userId: userData.userId,
				nickname: userData.nickname,
				...tokenInfo,
			},
		};
	}
};

export const setNickname = async (body) => {
	const { userId, nickname } = body;
	console.log("userId:", userId, "nickname:", nickname);
	const bodyArr = [userId, nickname];

	bodyArr.forEach((value) => {
		if (!value) throw new BaseError(status.BAD_REQUEST);
	});

	const result = await setUserNickname(userId, nickname);
	if (result == -1) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		const userInfo = await getUserInfos(userId);

		return {
			userId: userInfo.userId,
			nickname: userInfo.nickname,
		};
	}
};

export const changeUserStatus = async (userId, userStatus) => {
	console.log(userId);
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
