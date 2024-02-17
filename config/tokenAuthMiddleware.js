import jwt from "jsonwebtoken";
import { response } from "./response.js";
import { status } from "./responseStatus.js";

export const tokenAuthMiddleware = (req, res, next) => {
	try {
		const header = req.headers["authorization"];
		console.log('header', header);
		const token = header && header.split(" ")[1];
		console.log('token', token);
		// console.log(header, token);
		if (token == null) return res.send(response(status.EMPTY_TOKEN));

		jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
			if (err) {
				console.log(err);
				return res.send(response(status.FORBIDDEN));
			}
			console.log('user : ', user);
			req.user = user;
			next();
		});
	} catch (err) {
		console.log(err);
	}
};
