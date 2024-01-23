import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import {
	confirmEmail,
	confirmUser,
	getUser,
	getUserId,
	insertUserSql,
	patchNickname,
} from "./UserSql.js";

export const checkUserEmail = async (data) => {
	try {
		const conn = await pool.getConnection();

		const [confirm] = await pool.query(confirmEmail, data.email);

		if (confirm[0].isExistEmail) {
			conn.release();
			return -1;
		}

		const created = new Date();
		const result = await pool.query(insertUserSql, [
			data.email,
			// data.gender,
			"F",
			1, // status
			created, // created_at
		]);

		conn.release();
		return result[0].insertId;
	} catch (err) {
		console.log(err);
		res.send(response(status.BAD_REQUEST, err.message));
	}
};

export const getUserIdByEmail = async (email) => {
	try {
		const conn = await pool.getConnection();
		const [user] = await pool.query(getUserId, email);

		if (user.length == 0) {
			return -1;
		}

		conn.release();
		return user[0].id;
	} catch (err) {
		console.log(err);
		res.send(response(status.BAD_REQUEST, err.message));
	}
};

export const getUserInfo = async (userId) => {
	try {
		const conn = await pool.getConnection();
		const [user] = await pool.query(getUser, userId);

		if (user.length == 0) {
			return -1;
		}

		conn.release();
		return user[0];
	} catch (err) {
		console.log(err);
		res.send(response(status.BAD_REQUEST, err.message));
	}
};

export const setUserNickname = async (userId, nickname) => {
	try {
		const conn = await pool.getConnection();
		const [confirm] = await pool.query(confirmUser, userId);

		if (!confirm[0].isExistUser) {
			conn.release();
			return -1;
		}

		const result = await pool.query(patchNickname, [nickname, userId]);

		conn.release();
		return result[0].changedRows;
	} catch (err) {
		console.log(err);
		throw new BaseError(status.PARAMETER_IS_WRONG);
	}
};
