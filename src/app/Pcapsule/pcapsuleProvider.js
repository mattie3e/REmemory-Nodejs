import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import { savePassword_d, checkCapsuleNum_d } from "./pcapsuleDao.js";

// 캡슐넘버 생성
export const createCapsuleNum_p = async (nickname) => {
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

//유저의 capsule list 가져오기
export const getUserCapsules_p = async (user_id) => {
	const connection = await pool.getConnection(async (conn) => conn);

	try {
		const userId = user_id;
		const data = await getPcapsulesByUserId(connection, userId);

		console.log(data);

		return data;
	} catch (error) {
		console.error("Error in getUserCapsules_p:", error);
		throw error;
	} finally {
		if (connection) {
			connection.release();
		}
	}
};
