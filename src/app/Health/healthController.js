import { pool } from "../../../config/dbConfig.js";
import { status } from "../../../config/responseStatus.js";
import { BaseError } from "../../../config/error.js";
import { response } from "../../../config/response.js";

export const healthController = (req, res, next) => {
	res.send("HELLO, I'm Healthy!");
};

export const healthDBController = async (req, res, next) => {
	try {
		const conn = await pool.getConnection();
		const query = "SELECT * FROM connection_test WHERE id = 1";

		const [check] = await conn.query(query);

		conn.release();
		res.send(
			response(status.SUCCESS, {
				check,
			}),
		);
	} catch (err) {
		console.log(err);
		throw new BaseError(status.BAD_REQUEST);
	}
};
