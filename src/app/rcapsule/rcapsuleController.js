import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

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
    
    //받은 정보를 응답으로 -> response에 넣기
    res.send(
        response(status.SUCCESS,{
                numNUrl : data
             }),
        );
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
        
        res.send(
            response(status.SUCCESS, {
                dearNid : data
            }),
        );
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
    // params인지 body인지 햇갈리는데 차이는?!
    try{
        //aws s3에 업로드 된 파일 url 접근 및 db 저장
        //console.log(req.file.locatiron); // aws s3에 올려진 파일 url

        const {from_name, content_type, image_url, body} = req.body;
        
        //형식적 validation 처리 *이 부분 추가 수정하기
        if(!req.params.rcapsule_number){
            return res.send(response(status.BAD_REQUEST))
        }
        if(!from_name){
            return res.send(response(status.NOT_FOUND));
        } else if(!content_type){
            return res.send(response(status.NOT_FOUND));
        } else if(!image_url && !body){
            return res.send(response(status.NOT_FOUND));
        }        
        //처리 결과를 클라이언트에게 응답
        const result = await createText_s(req.file.location, req.params.rcapsule_number, req.body);

        res.send(
            response(status.SUCCESS, {
                ...req.body, // 원래의 데이터 복사
                capsule_number: result.capsuleNumber,
            })
        );
    }catch (error){ // * 추가
        res.send(status.INTERNAL_SERVER_ERROR, { error: "텍스트 및 사진 파일 업로드 실패.", detail: error});
        next(error);
        console.log(error);
    }
}