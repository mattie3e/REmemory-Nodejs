import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { getUserInfos } from "../User/userProvider.js";

import { createPcs_s, readPcs_s, readDetailPcs_s } from "./pcapsuleService.js";
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

// API Name : pcapsule 조회 API
// [GET] /retrieve
export const readPcs_c = async (req, res, next) => {
	try {
		const capsuleNumber = req.body.capsule_number;
		const capsulePassword = req.body.password;

		const data = await readPcs_s(capsuleNumber, capsulePassword);

		res.send(
			response(status.SUCCESS, {
				pcapsules: data,
			}),
		);
	} catch (error) {
		next(error);
	}
};

// API Name : pcapsule 상세조회 API
// [GET] /retrieveDetail
export const readDetailPcs_c = async (req, res, next) => {
	try {
		const capsuleNumber = req.body.capsule_number;
		const capsulePassword = req.body.password;

		const data = await readDetailPcs_s(capsuleNumber, capsulePassword);

		res.send(
			response(status.SUCCESS, {
				pcapsules: data,
			}),
		);
	} catch (error) {
		next(error);
	}
};
