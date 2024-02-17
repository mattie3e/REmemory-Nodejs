import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { getCapsule, getCapsuleType, updateOpenDate_d } from "./capsuleDao.js";
import { pool } from "../../../config/dbConfig.js";

export const getUserCapsules = async (userId) => {
	const capsules = await getCapsule(userId);

	const userCapsules = [];
	capsules.forEach((item) => {
		if (item.rcapsule_name != null) {
			userCapsules.push({
				capsule_number: item.capsule_number,
				capsule_name: item.rcapsule_name,
			});
		} else {
			userCapsules.push({
				capsule_number: item.capsule_number,
				capsule_name: item.pcapsule_name,
			});
		}
	});
	console.log(capsules);
	return { capsules: userCapsules, capsule_cnt: userCapsules.length };
};

export const getCapsuleByType = async (c_num) => {
	const capsuleType = await getCapsuleType(c_num);

	if (capsuleType == -1) throw new BaseError(status.CAPSULE_NOT_FOUND);

	return capsuleType;
};

// 캡슐 상태변경
export const updateOpenDate_p = async () => {
	const connection = await pool.getConnection(async (conn) => conn);

	try {
		connection.beginTransaction();

		console.log("updateOpenDate_p 시작");
		console.log("updateOpenDate_d 시작");
		await updateOpenDate_d(connection);
		console.log("updateOpenDate_d 종료");
		await connection.commit();

		return { message: "updateCapsule saved successfully." };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};
