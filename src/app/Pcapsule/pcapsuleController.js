import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { getUserInfos } from "../User/userProvider.js";

import {
	createPcs_s,
	readPcs_s,
	readDetailPcs_s,
	updatePcapsuleStatus_s,
	addTextImage_s,
	addVoice_s,
} from "./pcapsuleService.js";
import { savePassword_p } from "./pcapsuleProvider.js";

// API Name : pcapsule 생성 API
// [POST] /create
export const createPcs_c = async (req, res, next) => {
	// body: userId, pcapsule_name, open_date, dear_name, theme, content_type
	try {
		const userInfos = await getUserInfos(req.body.userId);
		const nickname = userInfos.nickname;
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

// [POST] create/text_image
export const addTextImage_c = async (req, res, next) => {
	try {
		const capsule_number = req.body.capsule_number;
		const textImageContent = req.body.contents; // 클라이언트가 보낸 글사진 데이터
		const align_type = req.body.align_type;

		const result = await addTextImage_s(
			textImageContent,
			capsule_number,
			align_type,
		);
		res.send(
			response(status.SUCCESS, {
				result,
			}),
		);
	} catch (error) {
		next(error);
	}
};

// [POST] create/voice
export const addVoice_c = async (req, res, next) => {
	try {
		const voiceFile = req.file;
		const capsule_number = req.body.capsule_number;
		const result = await addVoice_s(voiceFile, capsule_number);
		res.send(
			response(status.SUCCESS, {
				result,
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
		const capsuleNumber = req.query.capsule_number;
		const capsulePassword = req.query.capsule_password;

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
		const capsuleNumber = req.query.capsule_number;
		const capsulePassword = req.query.capsule_password;

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

// API Name : pcapsule 상태변경 API
// [PATCH] /delete/:id
export const updatePcs_c = async (req, res, next) => {
	try {
		const capsuleId = req.params.id; // URL 파라미터에서 id를 추출
		const newStatus = "unactivated"; // 하드코딩된 값으로 새로운 상태를 설정
		//const newStatus = req.body.status;

		const data = await updatePcapsuleStatus_s(capsuleId, newStatus);

		res.send(
			response(status.SUCCESS, {
				pcapsule: data, // 변경된 pcapsule 정보를 응답에 포함
			}),
		);
	} catch (error) {
		next(error);
	}
};
