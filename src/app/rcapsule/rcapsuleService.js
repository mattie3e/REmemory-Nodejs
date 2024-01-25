// Service
//db 연결
import { pool } from "../../../config/dbConfig.js";
import { status } from "../../../config/responseStatus.js";
import { readNumNUrl_d, 
        readDear_d,
        createText_d,
} from "./rcapsuleDao.js";

//캡슐 번호 및 url 가져오기
export const readNumnUrl_s = async (capsuleNumber) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
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

// capsulenumber, 
export const readDear_s = async(capsuleNumber) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
        //DAO를 총해 캡슐 정보 조회
        const rCapsuleData = await readDear_d(connection, capsuleNumber);

        const resdata = {
            dear_name : rCapsuleData.dear_name,
            capsule_id : rCapsuleData.capsule_id,
        }
        return ({rcapsule : resdata});
    }catch (error){
        //에러 발생 시 롤백
        await connection.rollback();
        throw error;
    } finally {
        //모든 경우에 연결 반환
        connection.release();
    }
};

//post textNphotos
export const createText_s = async(body) => {
    const connection = await pool.getConnection(async(conn) => conn);
    try{
        await connection.beginTransaction();

        //create TextNPhoto capsule : 함수를 호출하여 데이터 생성
        const rCapsuleData = await createText_d(connection, body);

        //rcapsuleData를 확인하여 예외 처리 또는 추가 작업 수행
        if(!rCapsuleData) {
            throw new BaseError(status.CAPSULE_NOT_FOUND);
        }
        
        await connection.commit();

        return ({data: rCapsuleData, });
    }catch (error){
        //에러 발생 시 롤백
        await connection.rollback();
        throw error;
    } finally {
        //모든 경우에 연결 반환
        connection.release();
    }
}