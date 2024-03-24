import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { sendNotificationEmail } from "./capsuleProvider.js";

export const getCapsule = async (userId) => {
	try {
		const conn = await pool.getConnection();

		const getCapsules =
			"SELECT time_capsule.capsule_number, rcapsule.rcapsule_name, pcapsule.pcapsule_name, rcapsule.theme as RT, pcapsule.theme as PT FROM time_capsule LEFT JOIN rcapsule ON time_capsule.capsule_number = rcapsule.capsule_number LEFT JOIN pcapsule ON time_capsule.capsule_number = pcapsule.capsule_number WHERE time_capsule.member_id = ?;";
		const [capsules] = await pool.query(getCapsules, [userId]);

		conn.release();
		return capsules;
	} catch (err) {
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
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const updateOpenDate_d = async (connection) => {
	const queryPcs = `UPDATE pcapsule SET status = 'OPENED' WHERE open_date <= CURDATE() AND status = 'LOCKED';`;
	const queryRcs = `UPDATE rcapsule SET status = 'OPENED' WHERE open_date <= CURDATE() AND status = 'LOCKED';`;
	const [p_result] = await connection.query(queryPcs);
	const [r_result] = await connection.query(queryRcs);

	if (p_result.changedRows > 0 || r_result.changedRows > 0) {
		sendNotificationEmail();
	}
};


export const deleteOpenCapsule_d = async (connection) => {
	const queryPcs = `DELETE FROM pcapsule WHERE open_date <= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 'OPENED';`;
	const queryRcs = `DELETE FROM rcapsule WHERE open_date <= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 'OPENED';`;
	const [p_result] = await connection.query(queryPcs);
	const [r_result] = await connection.query(queryRcs);
 
	// 삭제된 행의 총 수를 계산
	 const totalDeletedRows = p_result.affectedRows + r_result.affectedRows;
 
	 // 삭제된 행의 총 수가 0보다 크면 이메일을 보냄
	 if (totalDeletedRows > 0) {
		 sendDeleteEmail();
	 }
 };

 export const deleteStatusCapsule_d = async (connection) => {
	const queryPcs = `DELETE FROM pcapsule WHERE status = 'UNACTIVATED';`;
	const queryRcs = `DELETE FROM rcapsule WHERE status = 'UNACTIVATED';`;
	const [p_result] = await connection.query(queryPcs);
	const [r_result] = await connection.query(queryRcs);
 
	// 삭제된 행의 총 수를 계산
	 const totalDeletedRows = p_result.affectedRows + r_result.affectedRows;
 
	 // 삭제된 행의 총 수가 0보다 크면 이메일을 보냄
	 if (totalDeletedRows > 0) {
		 sendDeleteEmail();
	 }
 };



export const checkUpdatedRows = async (connection, oneDayAgo) => {
	const r_query = `SELECT capsule_number, rcapsule_name AS capsule_name, rcapsule_password AS capsule_password FROM rcapsule WHERE status = 'OPENED' AND updated_at >= ?;`;
	const p_query = `SELECT capsule_number, pcapsule_name AS capsule_name, pcapsule_password AS capsule_password FROM pcapsule WHERE status = 'OPENED' AND updated_at >= ?;`;

	const [r_rows] = await connection.query(r_query, [oneDayAgo]);
	const [p_rows] = await connection.query(p_query, [oneDayAgo]);

	const mergedRows = r_rows.concat(p_rows);

	return mergedRows;
};

export const getUserEmail = async (connection, capsule_number) => {
	const query = `SELECT m.email AS userEmail FROM member AS m JOIN time_capsule AS tc ON m.id = tc.member_id WHERE tc.capsule_number = ?;`;

	const [result] = await connection.query(query, [capsule_number]);

	return result[0].userEmail;
};


//삭제(status 바꾸기)
export const updateCapsuleStatus = async (connection, capsule_number, status, type) => {
	const query='';
	if (type==p) {
		const query = 'UPDATE pcapsule SET status = ? WHERE capsule_number = ?';
	} else {
		const query = 'UPDATE rcapsule SET status = ? WHERE capsule_number = ?';
	}
	
	await connection.query(query, [capsule_number, status]);
};



