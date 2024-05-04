import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

export const checkUserEmail = async (data) => {
	try {
		const conn = await pool.getConnection();
		const confirmEmail =
			"SELECT EXISTS(SELECT 1 FROM member WHERE email = ?) as isExistEmail";

		const [confirm] = await pool.query(confirmEmail, [data.email]);

		conn.release();
		return confirm[0].isExistEmail;
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const insertUser = async (data) => {
	try {
		const conn = await pool.getConnection();
		const insertUserSql =
			"INSERT INTO member (email, status, created_at) VALUES (?, ?, ?)";
		const created_at = new Date();

		const result = await pool.query(insertUserSql, [
			data.email,
			1, // status
			created_at, // created_at
		]);

		conn.release();
		return result[0].insertId;
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const getUserIdByEmail = async (email) => {
	try {
		const conn = await pool.getConnection();

		const getUserId = "SELECT id FROM member WHERE email = ?";
		const [user] = await pool.query(getUserId, [email]);

		if (user.length == 0) {
			return -1;
		}

		conn.release();

		return user[0].id;
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const getUserInfo = async (userId) => {
	try {
		const conn = await pool.getConnection();

		const getUser =
			"SELECT id, email, nickname, status FROM member WHERE id = ?";
		const [user] = await pool.query(getUser, [userId]);

		if (user.length == 0) {
			return -1;
		}

		conn.release();

		return user[0];
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const setUserNickname = async (userId, nickname) => {
	try {
		const conn = await pool.getConnection();
		const confirmUser =
			"SELECT EXISTS(SELECT 1 FROM member WHERE id = ?) as isExistUser";
		const [confirm] = await pool.query(confirmUser, [userId]);

		if (!confirm[0].isExistUser) {
			conn.release();
			return -1;
		}

		const patchNickname = "UPDATE member SET nickname = ? WHERE id = ?";
		const result = await pool.query(patchNickname, [nickname, userId]);

		conn.release();
		return result[0].changedRows;
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

// 추가된 코드

// 유저 계정 상태 변경
export const setUserStatus = async (userId, status) => {
	try {
		const conn = await pool.getConnection();
		const confirmUser =
			"SELECT EXISTS(SELECT 1 FROM member WHERE id = ?) as isExistUser";
		const [confirm] = await pool.query(confirmUser, [userId]);

		if (!confirm[0].isExistUser) {
			conn.release();
			return -1;
		}

		const patchStatus = "UPDATE member SET status = ? WHERE id = ?";
		const result = await pool.query(patchStatus, [status, userId]);

		conn.release();
		return result[0].changedRows;
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const setInactiveDate = async (userId) => {
	try {
		const conn = await pool.getConnection();
		const inactiveDate = new Date();
		const patchInactiveDate =
			"UPDATE member SET inactive_date = ? WHERE id = ?";
		await pool.query(patchInactiveDate, [inactiveDate, userId]);
		conn.release();
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const deleteInactiveUsers = async () => {
	try {
		const conn = await pool.getConnection();
		// curDate == 현재 날짜 - 8일
		const curDate = new Date();
		curDate.setDate(curDate.getDate() - 8); // 8일 전 날짜
		const getInactiveUsers =
			"SELECT id FROM member WHERE status = 0 AND inactive_date <= ?";
		const [inactiveUsers] = await pool.query(getInactiveUsers, [curDate]);

		for (const user of inactiveUsers) {
			await deleteUser(user.id);
		}

		conn.release();
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};

export const deleteUser = async (userId) => {
	try {
		const conn = await pool.getConnection();
		const deleteUserQuery = "DELETE FROM member WHERE id = ?";
		await pool.query(deleteUserQuery, [userId]);
		conn.release();
	} catch (err) {
		throw new BaseError(status.BAD_REQUEST);
	}
};
