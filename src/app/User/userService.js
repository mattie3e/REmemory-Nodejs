import { status } from "../../../config/responseStatus.js";
import { BaseError } from "../../../config/error.js";
import {
	getUserIdByEmail,
	getUserInfo,
	insertUser,
	setUserNickname,
	setUserStatus,
	setInactiveDate,
	resetInactiveDate,
} from "./userDao.js";
import { getUserInfos, getuserStatus, setUserJwt } from "./userProvider.js";

export const userSignAction = async (userCheck, userInfo) => {
	if (userCheck) {
		const userId = await getUserIdByEmail(userInfo.email);

		if (userId == -1) throw new BaseError(status.BAD_REQUEST);
		const tokenInfo = setUserJwt(userId);

		const userData = await getUserInfo(userId);

		// if (!userData.status) {
		// 	await changeUserStatus(userId, 1);
		// }

		if (!userData.status) {
			await changeUserStatus(userId, 0);
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
		const userId = await insertUser(userInfo);

		const tokenInfo = setUserJwt(userId);

		const userData = await getUserInfos(userId);

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

//추가 함수
export const changeInactiveDate = async (userId) => {
	// 사용자의 현재 상태를 확인
	const userData = await getuserStatus(userId);
	if (userData.status !== 0) {
		throw new BaseError(status.BAD_REQUEST);
	}

	// inactive_date를 초기화
	await resetInactiveDate(userId);

	return { message: "Account has been successfully activated." };
};
