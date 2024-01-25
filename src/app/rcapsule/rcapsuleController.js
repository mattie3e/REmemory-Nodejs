import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";
import baseResponse from "../../../config/response.js"; // 추가해야함

import { readNumnUrl_s, 
         readDear_s,
         createText_s,
    } from "./rcapsuleService.js";
/**
 * API Name : 캡슐번호, 롤링페이퍼 url 받기
 * [GET] : /rcapsule/info/:rcapsule_id
 * capsule_number, capsule_url
 */
export const readNumNUrl_c = async (req, res, next) => {
    try{
    //데이터 베이스에서 정보 조회
    const capsuleNumber = req.body.capsule_number;
	const capsuleUrl = req.body.url;

    const data = await readNumnUrl_s(capsuleNumber); 

    //받은 정보를 응답으로 보내기 .. status * 추가
    res.send({numNUrl : data});

    } catch(error) { //에러 처리
        next(error);
        console.log(error);
    }
}

/**
 * API NAME : url 들어왔을 시 화면
 * dearName 과 rcapsule_id 반환
 * [GET] : /:rcapsule_number/:rCapsuleCnt
 */
export const readDear_c = async(req, res, next) => {
    try {
        const capsuleNumber = req.body.capsule_number;
        
        const data = await readDear_s(capsuleNumber);
        
        res.send({dearNid : data, });

    }catch (error){
        next(error);
        console.log(error);
    }
}

/**
 * API NAME : 확인했어요! -> 글&사진 열기
 * [POST] : /rcapsule_number/text_photo
 */
export const createText_c = async(req, res, next) => {
    //body : from_name, content_type, image_url, body
    try{
        const {from_name, content_type, image_url, body} = req.body;
        
        //형식적 validation 처리
        if(!from_name){
            return res.send(errResponse(baseResponse.TEXTCAPSULE_FROM_NAME_EMPTY));
        } else if(!content_type){
            return res.send(errResponse(baseResponse.TEXTCAPSULE_CONTENT_TYPE_EMPTY));
        } else if(!image_url && !body){
            return res.send(errResponse(baseResponse.TEXTCAPSULE_IMAGEBODY_EMPTY));
        }        
        //처리 결과를 클라이언트에게 응답
        const result = await createText_s(req.body);

        res.send(
            response(status.SUCCESS, {
                ...req.body, // 원래의 데이터 복사
                capsule_number: result.capsuleNumber,
            })
        );
    }catch (error){ // * 추가
        next(error);
        console.log(error);
    }
}