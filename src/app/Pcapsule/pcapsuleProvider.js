import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import {
	savePassword_d,
	saveTextImage,
	saveVoice,
	updateOpenedStatus_d,
} from "./pcapsuleDao.js";

// 캡슐넘버 생성
export const createCapsuleNum_p = async (nickname) => {
	const connection = await pool.getConnection(async (conn) => conn);
	let capsule_number;

	while (true) {
		const random_number = Math.floor(Math.random() * 100000 + 1); // 1~100000 사이의 랜덤 숫자
		capsule_number = `${nickname}_${random_number}`;
		const isExistCapsule = await checkNumber(connection, capsule_number);
		if (!isExistCapsule) {
			break;
		}
	}
	connection.release();
	return capsule_number;
};

// 캡슐 비밀번호 추가
export const savePassword_p = async (capsule_number, pcapsule_password) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		connection.beginTransaction();

		await savePassword_d(connection, capsule_number, pcapsule_password);

		await connection.commit();

		return { message: "Password saved successfully." };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

// text_image or voice data 생성
export const createContent_p = async (content_type, content) => {
	const connection = await pool.getConnection(async (conn) => conn);

	let text_image_id = null;
	let voice_id = null;

	if (content_type === 1) {
		const { body, image_url, sort } = content;
		text_image_id = await saveTextImage(connection, body, image_url, sort);
	} else if (content_type === 2) {
		const { voice_url } = content;
		voice_id = await saveVoice(connection, voice_url);
	}

	connection.release();
	return { text_image_id, voice_id };
};

// 캡슐 상태변경
export const updateOpenedStatus_p = async () => {
	await updateOpenedStatus_d();
};



export const getUserCapsules_p = async (user_id) => {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        const userId = user_id;
        const data = await getPcapsulesByUserId(connection, userId);

        console.log(data);

        return data;
    } catch (error) {
        console.error('Error in getUserCapsules_p:', error);
        throw error; 
    } finally {

        if (connection) {
            connection.release();
        }
    }
};