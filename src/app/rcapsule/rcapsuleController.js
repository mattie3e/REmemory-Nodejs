import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { readNumnUrl_s } from "./rcapsuleService.js";
/**
 * API Name : 캡슐번호, 롤링페이퍼 url 받기
 * [GET] : /rcapsule/info/:rcapsule_id
 * capsule_number, capsule_url
 */
export const readNumNUrl_c = async (req, res, next) => {
    try{
    //데이터 베이스에서 정보 조회 ... getRcs_s //연결..
    const capsuleNumber = req.body.capsule_number;
	const capsuleUrl = req.body.url;

    const data = await getRcs_s(capsuleNumber,capsuleUrl); 

    //받은 정보를 응답으로 보내기
    res.send({numNUrl : data});

    } catch(error) { //에러 처리
        next(error);
        console.log('Error: ${error.message}');
        res.status(500).send(`Error: ${error.message}`);
    }
}

// readNumUrl.listen(port, () => {
//     console.log("rcapsule 캡슐 번호 및 롤링페이퍼 url 받기")
// })

/**
 * API NAME : url 들어왔을 시 화면
 * [GET] : /rcapsule_number
 */


/**
 * API NAME : 확인했어요! -> 글&사진 열기
 * [POST] : /rcapsule_number/text_photo
 */