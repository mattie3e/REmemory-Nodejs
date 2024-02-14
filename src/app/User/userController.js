import axios from "axios";
import dotenv from "dotenv";
import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";
import {
	changeUserStatus,
	setNickname,
	userSignAction,
} from "./userService.js";
import { emailCheck, getUserInfos, kakaoGetUserInfo } from "./userProvider.js";
import { BaseError } from "../../../config/error.js";

dotenv.config();

export const userSign = async (req, res) => {
	const code = req.query.code;
	if (!code) throw new BaseError(status.BAD_REQUEST);
	const userInfo = await kakaoGetUserInfo(code);
	const userCheck = await emailCheck(userInfo);

	const userData = await userSignAction(userCheck, userInfo);
	const type = userData.type;
	if (type == 1) {
		res.send(response(status.LOGIN_SUCCESS, userData.data));
	} else if (type == 0) {
		res.send(response(status.NICKNAME_REQUIRED, userData.data));
	}
};

export const userSetNickname = async (req, res) => {
	if (!req.user) {
		res.send(response(status.SUCCESS, await setNickname(req.body, 1)));
	} else {
		if (req.user.userId == req.body.userId) {
			res.send(response(status.SUCCESS, await setNickname(req.body, 0)));
		} else {
			throw new BaseError(status.FORBIDDEN);
		}
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
