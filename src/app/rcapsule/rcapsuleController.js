import { response } from "../../../config/response.js";
import { status } from "../../../config/responseStatus.js";

import { readNumnUrl_s, 
         readCapsuleCnt_s,
         readDearNameNCnt_s 
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

    const data = await readNumnUrl_s(capsuleNumber,capsuleUrl); 

    //받은 정보를 응답으로 보내기 .. status * 추가
    res.json({numNUrl : data});

    } catch(error) { //에러 처리
        next(error);
        console.log(error);
    }
}
/** X
 * redirection 
 * ./:rcapsule_number
 */
// export const userUrl_c = async(req, res, next)=> {
//     //동적으로 변하는 값 (ex. wit_98765) 가져오기
//     const rCapsuleNumber = req.params.rcapsule_number;
//     try{
//         //rcapsuleNumber에 대한 정보를 조회하는 등의 작업 수행
//         // 새로운 URL 생성
//         //1) db에서 해당 rcapsule_cnt 조회
//         const rCapsuleCnt = await readCapsuleCnt_s(rCapsuleNumber);
    
//         //2) 새로운 URL 생성
//         const redirectUrl = `/${rCapsuleNumber}/${rCapsuleCnt}`;
//         //3) redirection 수행
//         res.redirect(redirectUrl);

//     }catch (error){ // 에러 처리 ... *추가
//         next(error);
//         console.log(error);
//     }
// }
/**
 * API NAME : url 들어왔을 시 화면
 * dearName 과 rcapsule_id 반환
 * [GET] : /:rcapsule_number/:rCapsuleCnt
 */
export const readDearNameNCnt_c = async(req, res, next) => {
    try {
        
    }catch (error){
        next(error);
        console.log(error);
    }
}


/**
 * API NAME : 확인했어요! -> 글&사진 열기
 * [POST] : /rcapsule_number/text_photo
 */