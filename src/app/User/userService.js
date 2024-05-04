import { status } from "../../../config/responseStatus.js";
import { BaseError } from "../../../config/error.js";
import {
	getUserIdByEmail,
	getUserInfo,
	insertUser,
	setUserNickname,
	setUserStatus,
	setInactiveDate,
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
			// 비활성화 -> 삭제 로직 구현 위한 코드 추가 line:85~88
			if (userStatus === 0) {
				// 비활성화 상태인 경우
				await setInactiveDate(userId); // 비활성화 날짜 저장
			}
			return await getuserStatus(userId);
		}
	}
};
