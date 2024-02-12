// Service
//db 연결
import { pool } from "../../../config/dbConfig.js";
import { status } from "../../../config/responseStatus.js";
import { BaseError } from "../../../config/error.js";
import { response } from "../../../config/response.js";
import {
	readNumNUrl_d,
	readDear_d,
	addTextImage_d,
	setRcapsuleWriter,
	insertTimeCapsule,
	getTimeCapsuleId,
	insertRcapsule,
	getRcapsuleId,
	updatePassword,
	setRcapsuleWriter_n,
	getWriterId,
	addVoiceLetter_d,
	checkRcapsule_d,
} from "./rcapsuleDao.js";

import { createCapsuleNum_r } from "./rcapsuleProvider.js";

//캡슐 번호 및 url 가져오기
export const readNumnUrl_s = async (capsuleNumber) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		connection.beginTransaction();

		//캡슐 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);
		if (isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		//캡슐 정보 조회
		const rcapsuleData = await readNumNUrl_d(connection, capsuleNumber);

		const resNumNUrl = {
			capsule_number: rcapsuleData.capsule_number,
			capsule_url: rcapsuleData.capsule_url,
		};

		await connection.commit();

		res.send(
			response(status.SUCCESS, {
				numNUrl: resNumNUrl,
			}),
		);
	} catch (error) {
		await connection.rollback(); //실패 시 롤백
		throw error;
	} finally {
		//모든 경우에 연결 반환
		connection.release();
	}
};

// url 들어왔을 시 화면
export const readDear_s = async (capsuleNumber) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		connection.beginTransaction();

		//캡슐 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);
		if (isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		//DAO를 총해 캡슐 정보 조회
		const rCapsuleData = await readDear_d(connection, capsuleNumber);

		const resdata = {
			dear_name: rCapsuleData.dear_name,
			capsule_id: rCapsuleData.capsule_id,
		};
		res.send(
			response(status.SUCCESS, {
				dearNid: resdata,
			}),
		);
	} catch (error) {
		//에러 발생 시 롤백
		await connection.rollback();
		throw error;
	} finally {
		//모든 경우에 연결 반환
		connection.release();
	}
};

//post textNphotos * photo 파일 변환하기 * error
export const createText_s = async (imageurl, capsule_number, body) => {
	const connection = await pool.getConnection(async (conn) => conn);
	const { from_name, content_type } = body;

	const requiredFields = ["from_name", "content_type"];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error("Missing required filed: ${field}");
		}
	});
	try {
		connection.beginTransaction();

		//capsule 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);
		if (isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		const rcapsule_id = await getRcapsuleId(connection, capsule_number);

		await setRcapsuleWriter(connection, rcapsule_id, from_name, content_type);

		const writer_id = await getWriterId(connection, rcapsule_id);

		await addTextImage_d(connection, imageurl, writer_id);

		await connection.commit();

		res.send(
			response(status.SUCCESS, {
				data: rCapsuleData,
			}),
		);
	} catch (error) {
		//에러 발생 시 롤백
		await connection.rollback();
		throw error;
	} finally {
		//모든 경우에 연결 반환
		connection.release();
	}
};

export const postRcapsule = async (body, nickname, userId) => {
	// 값이 제대로 전송 안된 경우
	const { rcapsule_name, open_date, dear_name } = body;
	const requiredFields = [
		"rcapsule_name",
		"open_date",
		"dear_name",
		// "theme", //DB 테이블에 맞춰서 rcapsule은 theme 제외
	];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	console.log("body 추출 : ", rcapsule_name, open_date, dear_name);

	const capsule_number = await createCapsuleNum_r(nickname);
	const rcapsule_url = `${process.env.FRONT_DOMAIN}/rcapsule_number=${capsule_number}`;
	//url 생성 (프론트 배포 링크 기준이 되어야 할듯)

	const connection = await pool.getConnection(async (conn) => conn);
	try {
		await connection.beginTransaction();
		console.log("transaction start!");
		//create time_capsule
		await insertTimeCapsule(connection, capsule_number, userId);
		console.log("insertTimeCapsule 성공");

		//create rcapsule
		const time_capsule_id = await getTimeCapsuleId(connection, capsule_number);
		console.log("time_capsule_id : ", time_capsule_id);

	   if (!time_capsule_id) {
		   throw new BaseError(status.CAPSULE_NOT_FOUND);
	   }
	   const insertData = [
		   time_capsule_id,
		   capsule_number,
		   rcapsule_name,
		   rcapsule_url,
		   open_date,
		   dear_name,
	   ];

	   const createRcsData = await insertRcapsule(connection, insertData);
	   console.log('insertRcapsule성공', createRcsData);

		const newRcapsuleId = await getRcapsuleId(connection, capsule_number);
		console.log("getRcapsuleId 성공");

		await connection.commit();

		return { ...createRcsData, capsule_number, newRcapsuleId };
	} catch (error) {
		await connection.rollback(); // 실패 시 롤백
		throw new BaseError(status.INTERNAL_SERVER_ERROR);
	} finally {
		connection.release();
	}
};

export const setPassword_s = async (body, rcapsule_id) => {
	const { rcapsule_password } = body;
	console.log("rcapsuleService.js, body :", body, "rcapusle_id", rcapsule_id);

	if (!rcapsule_password) {
		throw new BaseError(status.BAD_REQUEST);
	}

	const connection = await pool.getConnection(async (conn) => conn);

	const check_rcapsule = await checkRcapsule_d(connection, rcapsule_id);
	// console.log(check_rcapsule);
	if(!check_rcapsule) {
		throw new BaseError(status.CAPSULE_NOT_FOUND);
	}

	try {
		connection.beginTransaction();

		await updatePassword(connection, rcapsule_password, rcapsule_id);

		await connection.commit();

		return response(status.SUCCESS);
	} catch (error) {
		await connection.rollback();
		throw new BaseError(status.INTERNAL_SERVER_ERROR);
	} finally {
		connection.release();
	}
};

//음성 파일 url db에 추가
export const addVoiceLetter_s = async (voiceUrl, capsule_number, body) => {
	const connection = await pool.getConnection(async (conn) => conn);

	const { from_name, content_type, theme } = body;
	console.log(
		"***rcapsuleService.js***\n\n voiceUrl :",
		voiceUrl,
		"capsule_number :",
		capsule_number,
		"body: ",
		body,
	);

	const requiredFields = ["from_name", "theme", "content_type"];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	const check_rcapsule = await checkRcapsule_d(connection, capsule_number);

	if(!check_rcapsule) {
		throw new BaseError(status.CAPSULE_NOT_FOUND);
	}

	try {
		connection.beginTransaction();

		const rcapsule_id = await getRcapsuleId(connection, capsule_number);
		console.log("rcapsule_id", rcapsule_id);

		await setRcapsuleWriter_n(
			connection,
			rcapsule_id,
			from_name,
			theme,
			content_type,
		);

		const writer_id = await getWriterId(connection, rcapsule_id);
		console.log("writer_id : ", writer_id);

		await addVoiceLetter_d(connection, voiceUrl, writer_id);

		await connection.commit();

		return response(status.SUCCESS);
	} catch (error) {
		await connection.rollback();
		console.log("rcapsuleService.js error : ", error);
		throw error;
	} finally {
		connection.release();
	}
};
