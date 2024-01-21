import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";


/**
 * API Name : 캡슐번호, 롤링페이퍼 url 받기
 * [GET] : /rcapsule/info/:rcapsule_id
 */
exports.readNumNUrl = async (req, res) => {
    //쿼리 매개변수에서 정보 추출
    const param1 = req.quet
    //body : rcapsule_number, rcapsule_url
}

readNumUrl.listen(port, () => {
    console.log("rcapsule 캡슐 번호 및 롤링페이퍼 url 받기")
})

// // API Name : pcapsule 조회 API
// // [GET] /retrieve
// export const readPcs_c = async (req, res, next) => {
// 	// body: capsule_number, password
// 	console.log("pcs 조회");
// 	console.log("body:", req.body);

// 	res.send(status.SUCCESS, await readPcs_p);
// };

/**
 * API NAME : url 들어왔을 시 화면
 * [GET] : /rcapsule_number
 */

/**
 * API NAME : 확인했어요! -> 글&사진 열기
 * [POST] : /rcapsule_number/text_photo
 */