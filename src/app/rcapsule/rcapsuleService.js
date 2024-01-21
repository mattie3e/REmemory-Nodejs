// Service
//db 연결
import { pool } from "../../../config/dbConfig.js";
import { status } from "../../../config/responseStatus.js";
import { readNumNUrl_d, 
        readCapsuleCnt_d,
} from "./rcapsuleDao.js";

//캡슐 번호 및 url 가져오기
export const readNumnUrl_s = async (capsuleNumber, capsuleUrl) => {
    try {const connection = await pool.getConnection();
    //캡슐 존재 확인
    //..
    //DAO를 통해 캡슐 정보 조회
    const rcapsuleData = await readNumNUrl_d(connection, capsuleNumber);

    const resNumNUrl = {
        capsule_number: rcapsuleData.capsule_number,
        capsule_url : rcapsuleData.capsule_url,
    }

    return( {numNurl : resNumNUrl, });
    } catch (error){
        //에러 발생 시 롤백
        await connection.rollback();
        throw error;
    } finally {
        //모든 경우에 연결 반환
        connection.release();
    }
};

// X
// //리다이렉트 부분
// export const readCapsuleCnt_s = async(rCapsuleNumber) => {
//     try{
//         //DAO를 통해 캡슐Cnt 조회
//         const rCapsuleData = await readCapsuleCnt_d(connection, rCapsuleNumber);
//         const resCnt = {
//             capsule_cnt : rCapsuleData.capsule_cnt,
//         }
//         //조회된 값이 있다면 해당 값을 반환
//         if(resCnt){
//             return resCnt;
//         } else{
//             // 조회된 값이 없다면..!  * 추가
//             throw new BaseError(status.CAPSULE_NOT_FOUND);
//         }
//     }catch (error){
//         //에러 발생 시 롤백
//         await connection.rollback();
//         throw error;
//     } finally {
//         //모든 경우에 연결 반환
//         connection.release();
//     }
// };