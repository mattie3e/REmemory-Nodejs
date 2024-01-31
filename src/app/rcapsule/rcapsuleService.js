// Service
//db 연결
import { pool } from "../../../config/dbConfig.js";
import { status } from "../../../config/responseStatus.js";
import { readNumNUrl_d, 
        readDear_d,
        addTextImage_d,
        setRcapsuleWriter,
} from "./rcapsuleDao.js";

//캡슐 번호 및 url 가져오기
export const readNumnUrl_s = async (capsuleNumber) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();

        //캡슐 존재 확인
        const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);
        if (isExistCapsule){
            throw new BaseError(status.CAPSULE_NOT_FOUND);
        }

        //캡슐 정보 조회
        const rcapsuleData = await readNumNUrl_d(connection, capsuleNumber);
        
        const resNumNUrl = {
            capsule_number: rcapsuleData.capsule_number,
            capsule_url : rcapsuleData.capsule_url,
        }
        
        await connection.commit();

        res.send(
            response(status.SUCCESS, {
                numNUrl : resNumNUrl,
            }),
        );
    } catch (error){
        await connection.rollback(); //실패 시 롤백
        throw error;
    } finally {
        //모든 경우에 연결 반환
        connection.release();
    }
};

// url 들어왔을 시 화면
export const readDear_s = async(capsuleNumber) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();

        //캡슐 존재 확인
        const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);
        if (isExistCapsule){
            throw new BaseError(status.CAPSULE_NOT_FOUND);
        }

        //DAO를 총해 캡슐 정보 조회
        const rCapsuleData = await readDear_d(connection, capsuleNumber);

        const resdata = {
            dear_name : rCapsuleData.dear_name,
            capsule_id : rCapsuleData.capsule_id,
        }
        res.send(
            response(status.SUCCESS,{
                dearNid : resdata,
            }),
        );
    }catch (error){
        //에러 발생 시 롤백
        await connection.rollback();
        throw error;
    } finally {
        //모든 경우에 연결 반환
        connection.release();
    }
};

//post textNphotos * photo 파일 변환하기 * error
export const createText_s = async(imageurl, capsule_number, body) => {
    const connection = await pool.getConnection(async(conn) => conn);
    const {from_name, content_type} = body;

    const requiredFields = [
        "from_name",
        "content_type"
    ];

    requiredFields.forEach((field) => {
        if(!body.hasOwnProperty(field)){
            throw new Error ('Missing required filed: ${field}');
        }
    });
    try{
        connection.beginTransaction();
        
        //capsule 존재 확인
        const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);
        if(isExistCapsule){
            throw new BaseError(status.CAPSULE_NOT_FOUND);
        }
        
        const rcapsule_id = await getRcapsuleId(connection, capsule_number);
        
        await setRcapsuleWriter(connection, rcapsule_id, from_name, content_type);

        const writer_id = await getWriterId(connection, rcapsule_id);

        await addTextImage_d(connection, imageurl, writer_id);

        await connection.commit();

        res.send(
            response(status.SUCCESS,{
                data : rCapsuleData,
            }),
        );
    }catch (error){
        //에러 발생 시 롤백
        await connection.rollback();
        throw error;
    } finally {
        //모든 경우에 연결 반환
        connection.release();
    }
}