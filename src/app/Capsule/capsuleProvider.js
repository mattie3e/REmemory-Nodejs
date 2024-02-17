import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { getCapsule, getCapsuleType } from "./capsuleDao.js";

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
