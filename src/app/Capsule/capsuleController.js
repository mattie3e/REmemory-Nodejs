import { BaseError } from "../../../config/error";
import { response } from "../../../config/response";
import { status } from "../../../config/responseStatus";
import { readDetailPcs_c, readPcs_c } from "../Pcapsule/pcapsuleController.js";
import { readDetailRcs_c, readRcs_c } from "../Rcapsule/rcapsuleController.js";
import { getCapsuleByType, getUserCapsules } from "./capsuleProvider.js";

export const readCapsuleByType = async (req, res, next) => {
	// capsule_number, capsule_password
	const pw = req.query.capsule_password;
	const c_num = req.query.capsule_number;
	console.log(pw, c_num);
	if (!c_num || !pw) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		// 1 - p , 0 - r
		if (await getCapsuleByType(c_num, pw)) {
			readPcs_c(req, res, next);
		} else {
			//rcapsule 조회 controller 코드
			readRcs_c(req, res, next);
		}
	}
};

export const readCapsuleDetail = async (req, res, next) => {
	// capsule_number, capsule_password
	const pw = req.query.capsule_password;
	const c_num = req.query.capsule_number;
	console.log(pw, c_num);
	if (!c_num || !pw) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		// 1 - p , 0 - r
		if (await getCapsuleByType(c_num, pw)) {
			readDetailPcs_c(req, res, next);
		} else {
			//rcapsule 조회 controller 코드 (상세조회 not상상세)
			readDetailRcs_c(req, res, next);
		}
	}
};

export const getOwnCapsules = async (req, res, next) => {
	console.log("getOwnCapsules 시작, req.user.userId: ", req.user.userId);
	console.log("getOwnCapsules , req.params.userId: ", req.query.userId);
	const check = req.user.userId != req.query.userId ? 0 : 1;
	console.log("getOwnCapsules , check: ", check);
	if (req.user.userId != req.query.userId) {
		throw new BaseError(status.FORBIDDEN);
	} else if (!req.user) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		res.send(
			response(status.SUCCESS, await getUserCapsules(req.params.userId)),
		);
	}
};
