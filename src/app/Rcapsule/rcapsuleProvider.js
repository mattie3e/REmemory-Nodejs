import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import { checkCapsuleNum_d, updateOpenedStatus_d } from "./rcapsuleDao.js";

export const createCapsuleNum_r = async (nickname) => {
    const connection = await pool.getConnection(async (conn) => conn);
    let capsule_number;

    while (true) {
        const random_number = Math.floor(Math.random() * 100000 + 1); // 1~100000 사이의 랜덤 숫자
        capsule_number = `${nickname}_${random_number}`;

        const isExistCapsule = await checkCapsuleNum_d(connection, capsule_number);
        if (!isExistCapsule) {
            break;
        }
    }

    connection.release();
    return capsule_number;
};

// 캡슐 상태변경
export const updateOpenedStatus_r = async () => {
	await updateOpenedStatus_d();
};
