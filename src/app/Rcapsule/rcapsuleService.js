import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import { createCapsuleNum_r } from "./rcapsuleProvider.js";

import { 
    insertTimeCapsule, 
    getTimeCapsuleId, 
    insertRcapsule,
    updatePassword,
    getRcapsuleId,
    addVoiceLetter_d,
    getWriterId,
    setRcapsuleWriter
 } from "./rcapsuleDao.js";
import { response } from "express";

export const postRcapsule = async (body, nickname, userId) => {
     // 값이 제대로 전송 안된 경우
    const { rcapsule_name, open_date, dear_name } = body;
    const requiredFields = [
        "rcapsule_name",
        "open_date",
        "dear_name",
        // "theme",
    ];

    requiredFields.forEach((field) => {
        if(!body.hasOwnProperty(field)) {
            throw new Error(`Missing required field: ${field}`);
        }
    });

    const capsule_number = await createCapsuleNum_r(nickname);
    const rcapsule_url = `${process.env.FRONT_DOMAIN}/rcapsule_number=${capsule_number}`;

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
            rcapsule_url,
        ];

        const createRcsData = await insertRcapsule(connection, insertData);

        const newRcapsuleId = await getRcapsuleId(connection, capsule_number);

        await connection.commit();

        return { ...createRcsData, capsule_number, newRcapsuleId };
    }
    catch (error) {
        await connection.rollback(); // 실패 시 롤백
        throw new BaseError(status.INTERNAL_SERVER_ERROR);
    }
    finally {
        connection.release();
    }
};

export const setPassword_s = async (body, rcapsule_id) => {
    const { rcapsule_password } = body;

    if (!rcapsule_password) {
        throw new BaseError(status.BAD_REQUEST);
    }

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        connection.beginTransaction();

        await updatePassword(connection, rcapsule_password, rcapsule_id);

        await connection.commit();

        return response(status.SUCCESS);
    } catch (error) {
        await connection.rollback();
        throw new BaseError(status.INTERNAL_SERVER_ERROR);
    } finally {
        connection.release();
    }
};

export const addVoiceLetter_s = async (voiceUrl, capsule_number, body) => {
    const connection = await pool.getConnection(async (conn) => conn);
    
    const { from_name, theme, content_type } = body;

    const requiredFields = [
        "from_name",
        "theme",
        "content_type"
    ];

    requiredFields.forEach((field) => {
        if(!body.hasOwnProperty(field)) {
            throw new Error(`Missing required field: ${field}`);
        }
    });

    try {
        connection.beginTransaction();

        const rcapsule_id = await getRcapsuleId(connection, capsule_number);

        await setRcapsuleWriter(connection, rcapsule_id, from_name, theme, content_type);

        const writer_id = await getWriterId(connection, rcapsule_id);

        await addVoiceLetter_d(connection, voiceUrl, writer_id);

        await connection.commit();

        return response(status.SUCCESS);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};