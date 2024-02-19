import jwt from "jsonwebtoken";
import { response } from "./response.js";
import { status } from "./responseStatus.js";

export const tokenAuthMiddleware = (req, res, next) => {
	try {
		const header = req.headers["authorization"] || req.headers["Authorization"];

		const token = header && header.split(" ")[1];

		if (token == null) return res.send(response(status.EMPTY_TOKEN));

		jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
			if (err) {
				return res.send(response(status.FORBIDDEN));
			}

			req.user = user;
			next();
		});
	} catch (err) {
		console.log(err);
	}
};
