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
	checkCapsuleNum_d,
	checkPasswordValidity,
	retrieveCapsule_d,
	saveTextImage_rcs,
	getRollingPaperList,
	getRcapsuleUrl,
	retrievevoice_idBypcapsule_id,
	retrievetxt_img_idBypcapsule_id,
	getRcsWContentType,
	checkWid_d,
	getRcapsuleInfo,
	checkRcapsulePw,
} from "./rcapsuleDao.js";

import { createCapsuleNum_r } from "./rcapsuleProvider.js";
import { uploadImageToS3 } from "../../../config/multer.js";
import { text } from "express";

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

		// 캡슐 존재 확인
		const isExistCapsule = await checkRcapsule_d(connection, capsuleNumber);
		if (!isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		// 캡슐 비밀번호 설정 확인
		const isExistPassword = await checkRcapsulePw(connection, capsuleNumber);
		if(!isExistPassword) {
			throw new BaseError(status.CAPSULE_NOT_VALID);
		}

		//DAO를 총해 캡슐 정보 조회
		const rCapsuleData = await readDear_d(connection, capsuleNumber);
		console.log("DAO를 총해 캡슐 정보 조회", rCapsuleData);

		const resdata = {
			dear_name: rCapsuleData.dear_name,
			capsule_id: rCapsuleData.id,
			theme: rCapsuleData.theme,
		};
		return resdata;
	} catch (error) {
		//에러 발생 시 롤백
		await connection.rollback();
		throw error;
	} finally {
		//모든 경우에 연결 반환
		connection.release();
	}
};

// **수정된 글/사진 쓰기 로직**
export const addTextImage_rcs = async (
	capsule_number,
	textImageContent,
	align_type,
	from_name,
) => {
	const connection = await pool.getConnection(async (conn) => conn);

	try {
		connection.beginTransaction();

		const isExistCapsule = await checkCapsuleNum_d(connection, capsule_number);

		if (!isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		const rcapsuleId = await getRcapsuleId(connection, capsule_number);

		const writer_id = await setRcapsuleWriter_n(
			connection,
			rcapsuleId,
			from_name,
			1,
		); //글/사진의 경우 1

		console.log("writer_id : ", writer_id);

		let textImageId = null;

		for (let i = 0; i < textImageContent.length; i++) {
			const value = textImageContent[i];
			if (value.type === "text") {
				textImageId = await saveTextImage_rcs(
					connection,
					writer_id,
					value.content,
					null,
					align_type,
				);
			} else if (value.type === "image") {
				const imageUrl = await uploadImageToS3(value.content);

				textImageId = await saveTextImage_rcs(
					connection,
					writer_id,
					null,
					imageUrl,
					align_type,
				);
			}
			if (!textImageId) throw new BaseError(status.INTERNAL_SERVER_ERROR);
		}

		await connection.commit();

		return { textImageId };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

export const postRcapsule = async (body, nickname, userId) => {
	// 값이 제대로 전송 안된 경우
	const { rcapsule_name, open_date, dear_name, theme } = body;
	const requiredFields = ["rcapsule_name", "open_date", "dear_name", "theme"];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	console.log("body 추출 : ", rcapsule_name, open_date, dear_name, theme);

	const capsule_number = await createCapsuleNum_r(nickname);
	const rcapsuleUrl = `${process.env.FRONT_DOMAIN}/rolling/${capsule_number}`;
	console.log(rcapsuleUrl);

	const connection = await pool.getConnection(async (conn) => conn);
	try {
		await connection.beginTransaction();
		// console.log("transaction start!");
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
			rcapsuleUrl,
			open_date,
			dear_name,
			theme,
		];

		const createRcsData = await insertRcapsule(connection, insertData);
		console.log("insertRcapsule성공", createRcsData);

		const newRcapsuleId = await getRcapsuleId(connection, capsule_number);
		const rcapsule_url = await getRcapsuleUrl(connection, capsule_number);

		console.log("url : ", rcapsule_url);

		await connection.commit();

		return { ...createRcsData, capsule_number, newRcapsuleId, rcapsule_url };
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
	if (!check_rcapsule) {
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

	// const { from_name, content_type, theme } = body;
	const { from_name, content_type } = body;

	const requiredFields = ["from_name", "content_type"];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	const check_rcapsule = await checkRcapsule_d(connection, capsule_number);

	if (!check_rcapsule) {
		throw new BaseError(status.CAPSULE_NOT_FOUND);
	}

	try {
		connection.beginTransaction();

		const rcapsule_id = await getRcapsuleId(connection, capsule_number);
		console.log("rcapsule_id", rcapsule_id);

		const writer_id = await setRcapsuleWriter_n(connection, rcapsule_id, from_name, content_type);
		console.log('찐 writer : ', writer_id);

		// const writer_id = await getWriterId(connection, rcapsule_id, from_name, content_type);
		// console.log("writer_id : ", writer_id);

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

// rcapsule 조회 코드 추가

//캡슐 조회
export const readRcs_s = async (capsuleNumber, capsulePassword) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		await connection.beginTransaction();

		// 캡슐 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);

		if (!isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}
		console.log("n", capsuleNumber, "p", capsulePassword);

		// 패스워드 확인
		const isPasswordValid = await checkPasswordValidity(
			connection,
			capsuleNumber,
			capsulePassword,
		);
		console.log(isPasswordValid);

		if (!isPasswordValid) {
			throw new BaseError(status.CAPSULE_PASSWORD_WRONG);
		}

		// 캡슐 정보 조회
		const rcapsuleData = await retrieveCapsule_d(connection, capsuleNumber);
		console.log("readRcs_s : ", rcapsuleData);

		// 상세정보를 전부 반환하지 않고 일부만 반환
		const responseData = {
			capsule_number: rcapsuleData.capsule_number,
			rcapsule_name: rcapsuleData.rcapsule_name,
			rcapsule_cnt: rcapsuleData.rcapsule_cnt,
			open_date: rcapsuleData.open_date,
			dear_name: rcapsuleData.dear_name,
			theme: rcapsuleData.theme,
			status: rcapsuleData.status,
		};

		await connection.commit();

		return responseData;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

//캡슐 상세조회
export const readDetailRcs_s = async (capsuleNumber, capsulePassword) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		await connection.beginTransaction();

		// 캡슐 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);

		if (!isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		// 패스워드 확인
		const isPasswordValid = await checkPasswordValidity(
			connection,
			capsuleNumber,
			capsulePassword,
		);
		console.log('readDetailRcs_s : ', capsuleNumber, capsulePassword);
		console.log('isPasswordValid : ', isPasswordValid);

		if (!isPasswordValid) {
			throw new BaseError(
				status.CAPSULE_PASSWORD_WRONG,
				"패스워드가 잘못되었습니다.",
			);
		}

		// 캡슐 정보 조회
		const rcapsuleData = await retrieveCapsule_d(connection, capsuleNumber);
		// 추가된 로직: opened 상태의 캡슐만 반환
		if (rcapsuleData.status !== "OPENED") {
			throw new BaseError(status.CAPSULE_NOT_OPENED);
		}

		const rcapsule_id = await getRcapsuleId(connection, capsuleNumber);

		const rollingPaperList = await getRollingPaperList(connection, rcapsule_id);

		const { theme, dear_name, rcapsule_name } = await getRcapsuleInfo(connection, rcapsule_id);

		await connection.commit();

		return { rollingPaperList, theme, dear_name, rcapsule_name };

	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

//캡슐 상상세조회!
export const readInnerDetailRcs_s = async (wId) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		await connection.beginTransaction();

		// writer 존재 확인
		console.log('readInnerDetailRcs_s', wId);
		const isExistW = await checkWid_d(connection, wId);
		console.log("isExistW:", isExistW);
		if (!isExistW) {
			throw new BaseError(status.WRONG_WRITER);
		}

		// writer content type, from_name 가져오기
		const wData = await getRcsWContentType(connection, wId);
		console.log("wdata:", wData);

		let text_img_data = null;
		let voice_data = null;
		let align_type = null;

		// 배열 형식으로 조회 값 저장, 반환하는 로직으로 변경
		if (wData.content_type === 1) {
			text_img_data = await retrievetxt_img_idBypcapsule_id(
				connection,
				wData.id,
			);
			console.log('text_img_data', text_img_data);

			align_type = text_img_data[0].align_type;

			text_img_data = text_img_data.map((row) => ({
				body: row.body,
				image_url: row.image_url,
			}));
		} else if (wData.content_type === 2) {
			console.log("?");
			voice_data = await retrievevoice_idBypcapsule_id(connection, wData.id);
		}

		const retrieveData = {
			from_name: wData.from_name,
			content_type: wData.content_type,
			text_img_data,
			voice_data,
			align_type,
		};

		await connection.commit();

		return retrieveData;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};
