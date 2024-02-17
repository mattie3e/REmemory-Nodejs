import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

export const getCapsule = async (userId) => {
	try {
		const conn = await pool.getConnection();

		const getCapsules =
			"SELECT time_capsule.capsule_number, rcapsule.rcapsule_name, pcapsule.pcapsule_name FROM time_capsule LEFT JOIN rcapsule ON time_capsule.capsule_number = rcapsule.capsule_number LEFT JOIN pcapsule ON time_capsule.capsule_number = pcapsule.capsule_number WHERE time_capsule.member_id = ?;";
		const [capsules] = await pool.query(getCapsules, [userId]);

		conn.release();
		return capsules;
	} catch (err) {
		console.log(err);
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const getCapsuleType = async (c_num) => {
	try {
		const conn = await pool.getConnection();

		const query =
			"SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;";
		const [checkCapsuleNumRow] = await conn.query(query, c_num);

		if (!checkCapsuleNumRow[0].isExistCapsule) {
			conn.release();
			return -1;
		}

		const typeP =
			"SELECT EXISTS(SELECT 1 FROM pcapsule WHERE capsule_number = ?) as isExist";

		const [pcapsule] = await conn.query(typeP, [c_num]);

		conn.release();
		return pcapsule[0].isExist;
	} catch (err) {
		console.log(err);
		throw new BaseError(status.BAD_REQUEST);
	}
};
