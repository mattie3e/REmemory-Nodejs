import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import { checkCapsuleNum_d } from "./rcapsuleDao.js";

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

// export const createRcapsule_p = async (capsule_number, rcapsule_name, open_date, dear_name, theme) => {
//     const connection = await pool.getConnection(async (conn) => conn);

//     try {
//         const time_capsule_id = await getTimeCapsuleId(connection, capsule_number);
//         if (!time_capsule_id) {
//             throw new BaseError(status.CAPSULE_NOT_FOUND);
//         }

//         const insertData = [
//             time_capsule_id,
//             capsule_number,
//             rcapsule_name,
//             open_date,
//             dear_name,
//         ];

//         const result = await insertRcapsule(connection, insertData);

//         return result;
//     } catch (error) {
//         throw error;
//     } finally {
//         connection.release();
//     }
// };
