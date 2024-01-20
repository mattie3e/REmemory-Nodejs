// Controller
import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { getUserInfos } from "../user/userService.js";

import { createPcs_s } from "./pcapsuleService.js";
import { savePassword_p } from "./pcapsuleProvider.js";

// API Name : pcapsule 생성 API
// [POST] /create
export const createPcs_c = async (req, res, next) => {
	// body: pcapsule_name, open_date, dear_name, theme, content_type, content
	try {
		const userId = req.user.userId;
		const userInfos = await getUserInfos({ userId: userId });
		const nickname = userInfos.data.nickname;
		const data = await createPcs_s(req.body, nickname);
		res.send(
			response(status.SUCCESS, {
				...data,
				capsule_number: data.capsule_number,
			}),
		);
	} catch (error) {
		next(error);
	}
};

// [POST] create/savePassword
export const savePassword_c = async (req, res, next) => {
	try {
		const { capsule_number, pcapsule_password } = req.body;
		const result = await savePassword_p(capsule_number, pcapsule_password);

		res.send(response(status.SUCCESS, result));
	} catch (error) {
		next(error);
	}
};

// [GET] pcapsule/{pcapsule_id}
export const getPcs_c = async (req, res, next) => {
	try {
		const { capsule_number, pcapsule_password } = req.body;
		const result = await getPcs_s(capsule_number, pcapsule_password);
		res.send(response(status.SUCCESS, result));
	} catch (error) {
		next(error);
	}
};
