import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import { createCapsuleNum_r } from "./rcapsuleProvider.js";

import { insertTimeCapsule, getTimeCapsuleId, insertRcapsule } from "./rcapsuleDao.js";

export const postRcapsule = async (body, nickname, userId) => {
     // 값이 제대로 전송 안된 경우
    const { rcapsule_name, open_date, dear_name, theme } = body;
    const requiredFields = [
        "rcapsule_name",
        "open_date",
        "dear_name",
        "theme",
    ];

    requiredFields.forEach((field) => {
        if(!body.hasOwnProperty(field)) {
            throw new Error(`Missing required field: ${field}`);
        }
    });

    const capsule_number = await createCapsuleNum_r(nickname);

    const connection = await pool.getConnection(async (conn) => conn);
    try {        
        await connection.beginTransaction();

        //create time_capsule
        await insertTimeCapsule(connection, capsule_number, userId);

        //create rcapsule
        const time_capsule_id = await getTimeCapsuleId(connection, capsule_number);

        if (!time_capsule_id) {
            throw new BaseError(status.CAPSULE_NOT_FOUND);
        }
        const insertData = [
            time_capsule_id,
            capsule_number,
            rcapsule_name,
            open_date,
            dear_name,
        ];

        const createRcsData = await insertRcapsule(connection, insertData);

        await connection.commit();

        return { ...createRcsData, capsule_number };
    }
    catch (error) {
        await connection.rollback(); // 실패 시 롤백
        throw new BaseError(status.INTERNAL_SERVER_ERROR);
    }
    finally {
        connection.release();
    }
}