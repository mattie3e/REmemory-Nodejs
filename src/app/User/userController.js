import axios from "axios";
import dotenv from "dotenv";
import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";
import {
	changeUserStatus,
	setNickname,
	userSignAction,
	changeInactiveDate,
} from "./userService.js";
import { emailCheck, getUserInfos, kakaoGetUserInfo } from "./userProvider.js";
import { BaseError } from "../../../config/error.js";

dotenv.config();

export const userSign = async (req, res) => {
	const code = req.query.code;
	if (!code) throw new BaseError(status.BAD_REQUEST);

	const userInfo = await kakaoGetUserInfo(code);

	const userCheck = await emailCheck(userInfo);
	console.log("1. controller, userData 시작 전");
	const userData = await userSignAction(userCheck, userInfo);
	console.log("9. controller, userData 후");
	const type = userData.type;
	console.log("10. 현재 controller, type: ", type);
	console.log("10. userData.data: ", userData.data);
	console.log("10. status: ", userData.data.status);

	if (type == 1) {
		if (userData.data.status === 0) {
			console.log(
				"11. 전달값:",
				response(status.INACTIVE_ACCOUNT, userData.data),
			);
			res.status(200).send(response(status.INACTIVE_ACCOUNT, userData.data));
		} else {
			res.send(response(status.LOGIN_SUCCESS, userData.data));
		}
	} else if (type == 0) {
		res.send(response(status.SIGNUP_SUCCESS, userData.data));
	}
};

export const userSetNickname = async (req, res) => {
	if (req.user.userId == req.body.userId) {
		res.send(response(status.SUCCESS, await setNickname(req.body)));
	} else {
		throw new BaseError(status.FORBIDDEN);
	}
};

export const userGetInfo = async (req, res) => {
	if (req.user.userId != req.params.userId) {
		throw new BaseError(status.FORBIDDEN);
	} else if (!req.user) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		res.send(response(status.SUCCESS, await getUserInfos(req.params.userId)));
	}
};

export const userStatusChange = async (req, res) => {
	if (req.user.userId != req.body.userId) {
		throw new BaseError(status.FORBIDDEN);
	} else if (!req.user) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		res.send(
			response(status.SUCCESS, await changeUserStatus(req.body.userId, 0)),
		);
	}
};

// 추가 함수
export const userActivate = async (req, res) => {
	if (req.user.userId != req.body.userId) {
		throw new BaseError(status.FORBIDDEN);
	}

	const userId = req.user.userId;

	try {
		await changeUserStatus(userId, 1); // 사용자 상태를 활성화로 변경
		await changeInactiveDate(userId); // inactive_date를 null로 초기화

		res.send(response(status.SUCCESS, { message: "계정이 활성화되었습니다." }));
	} catch (error) {
		throw new BaseError(status.BAD_REQUEST);
	}
};
