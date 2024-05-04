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
	console.log("2. service, userSignAction 들어 온 직후");
	if (userCheck) {
		const userId = await getUserIdByEmail(userInfo.email);

		if (userId == -1) throw new BaseError(status.BAD_REQUEST);

		const tokenInfo = setUserJwt(userId);

		const userData = await getUserInfo(userId);
		console.log("3. getUserInfo 후 userData: ", userData);

		if (userData.status === 0) {
			console.log(
				"4. userData.status 0일 때 changeUserStatus 시작 전: ",
				userData.status,
			);
			await changeUserStatus(userId, 0);
			console.log("changeUserStatus 후 status: ", userData.status);
		}

		return {
			type: 1,
			data: {
				userId: userData.id,
				nickname: userData.nickname,
				status: userData.status,
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
	console.log("4. changeUserStatus 들어온 직후 userStatuse: ", userStatus);
	if (!userId) throw new BaseError(status.BAD_REQUEST);

	// const userData = await getuserStatus(userId);
	// console.log("userData 체크 완료");

	const result = await setUserStatus(userId, userStatus);
	console.log("5. setUserStatus 후 result: ", result);
	if (result == -1) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		console.log("6. 현재 changeUserStatus, getuserStatus 들어가기 전");
		return await getuserStatus(userId);
	}

	// 원래 코드
	// if (userData.status == userStatus) {
	// 	throw new BaseError(status.CURRENT_STATUS);
	// } else {
	// 	const result = await setUserStatus(userId, userStatus);
	// 	if (result == -1) {
	// 		throw new BaseError(status.BAD_REQUEST);
	// 	} else {
	// 		return await getuserStatus(userId);
	// 	}
	// }
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
