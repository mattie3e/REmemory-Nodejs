import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { createPcs_s, updatePcs_s } from "./pcapsuleService.js";

// API Name : pcapsule 생성 API
// [POST] /create
export const createPcs_c = async (req, res, next) => {
	// body: pcapsule_name, open_date, dear_name, theme, content_type, content
	try {
		// 사용자 인증
		const token = req.headers.authorization;
		// 토큰으로부터 사용자의 id 추출하는 함수 (티티한테 관련된 함수 만들었는지 물어보기)
		const memeberId = getUserIdFromToken(token);

		const data = await createPcs_s(req.body, memberId);
		res.send(
			response(status.SUCCESS, {
				...data,
				capsule_number: data.capsule_number,
			}),
		);
	} catch (error) {
		next(error);
	}
};

// export const updatePcs_c = async (req, res, next) => {
// 	try {
// 		// 요청 파라미터에서 캡슐의 ID를 추출
// 		const { id } = req.params;

// 		res.send(response(status.SUCCESS, await updatePcs_s(id, req.body)));
// 	} catch (error) {
// 		next(error);
// 	}
// };

// // API Name : pcapsule 조회 API
// // [GET] /retrieve
// export const readPcs_c = async (req, res, next) => {
// 	// body: capsule_number, password
// 	console.log("pcs 조회");
// 	console.log("body:", req.body);

// 	res.send(status.SUCCESS, await readPcs_p);
// };
