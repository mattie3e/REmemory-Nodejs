import { BaseError } from "../../../config/error";
import { response } from "../../../config/response";
import { status } from "../../../config/responseStatus";
import { readDetailPcs_c, readPcs_c } from "../Pcapsule/pcapsuleController.js";
import { readDetailRcs_c, readRcs_c } from "../Rcapsule/rcapsuleController.js";
import { getCapsuleByType, getUserCapsules } from "./capsuleProvider.js";
import { updateCapsuleStatus } from "./capsuleDao.js";

export const readCapsuleByType = async (req, res, next) => {
	// capsule_number, capsule_password
	const pw = req.query.capsule_password;
	const c_num = req.query.capsule_number;
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
	if (req.user.userId != req.query.userId) {
		throw new BaseError(status.FORBIDDEN);
	} else if (!req.user) {
		throw new BaseError(status.BAD_REQUEST);
	} else {
		res.send(response(status.SUCCESS, await getUserCapsules(req.query.userId)));
	}
};



export const deleteStatusCapsule = async (req, res, next) => {
	try {
		const capsuleId = req.body.id; 
		const newStatus = "UNACTIVATED"; 
		const type=n; //무의미의 값
		if (req.body.capsule_type==1) {
			type = p;
		}
		else {
			type = r;
		}

		const data = await updateCapsuleStatus(capsuleId, newStatus, type);

		res.send(
			response(status.SUCCESS, {
				capsule: data, // 변경된 capsule 정보를 응답에 포함
			}),
		);
	} catch (error) {
		next(error);
	}
};

