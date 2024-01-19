import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { createPcs_s, updatePcs_s } from "./pcapsuleService.js";

// API Name : pcapsule 생성 API
// [POST] /create
export const createPcs_c = async (req, res, next) => {
	// body: pcapsule_name, open_date, dear_name, theme, content_type, content
	try {
		// 사용자 인증
		// const token = req.headers.authorization;
		// 토큰으로부터 사용자의 id 추출하는 함수 (티티한테 관련된 함수 만들었는지 물어보기)

		const nickname = getNicknameFromToken(token);

		// 위에 부분은 User or Memeber의 Dao, Provider에서 가져오면 되지 않을까 하는 생각입니다.
		// getNicknameFromToken 같은 함수!

		const data = await createPcs_s(req.body, nickname);
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
