// Service
import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { createCapsuleNum_p } from "./pcapsuleProvider.js";
import {
	checkCapsuleNum_d,
	insertPcapsule_d,
	insertCapsuleNum_d,
	retrieveCapsule_d,
	retrievetxt_img_idBypcapsule_id,
	retrievevoice_idBypcapsule_id,
	checkPasswordValidity,
	getPcapsuleId,
	saveTextImage,
	saveVoice,
	updateCapsuleStatus,
} from "./pcapsuleDao.js";

import { uploadImageToS3 } from "../../../config/multer.js";

// 캡슐 생성
export const createPcs_s = async (body, nickname) => {
	const { userId, pcapsule_name, open_date, dear_name, theme, content_type } =
		body;
	const requiredFields = [
		"userId",
		"pcapsule_name",
		"open_date",
		"dear_name",
		"theme",
		"content_type",
	];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	const openDate = new Date(open_date);
	const curDate = new Date();

	// 생성날짜보다 이전 날짜로 입력한 경우
	if (
		openDate.getFullYear() < curDate.getFullYear() ||
		(openDate.getMonth() <= curDate.getMonth() &&
			openDate.getDate() < curDate.getDate())
	) {
		throw new BaseError(status.OPEN_DATE_NOT_VALID);
	}

	const capsule_number = await createCapsuleNum_p(nickname);

	const connection = await pool.getConnection(async (conn) => conn);

	try {
		connection.beginTransaction();

		const capsule_id = await insertCapsuleNum_d(
			connection,
			capsule_number,
			userId,
		);

		const pcapsule_password = null;
		const insertData = [
			capsule_id,
			capsule_number,
			pcapsule_password,
			pcapsule_name,
			open_date,
			dear_name,
			theme,
			content_type,
		];
		await insertPcapsule_d(connection, insertData);

		await connection.commit();

		return { capsule_number };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

export const addTextImage_s = async (
	textImageContent,
	capsule_number,
	align_type,
) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		connection.beginTransaction();

		// 캡슐 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsule_number);

		if (!isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		const pcapsuleId = await getPcapsuleId(connection, capsule_number);

		let textImageId = null;

		for (let i = 0; i < textImageContent.length; i++) {
			const value = textImageContent[i];
			if (value.type === "text") {
				textImageId = await saveTextImage(
					connection,
					pcapsuleId,
					value.content, // 텍스트인 경우 값 저장
					null,
					align_type,
				);
			} else if (value.type === "image") {
				const imageUrl = await uploadImageToS3(value.content);

				textImageId = await saveTextImage(
					connection,
					pcapsuleId,
					null,
					imageUrl,
					align_type,
				);
			}
			if (!textImageId) throw new Error("Failed to save text content");
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

export const addVoice_s = async (voiceFile, capsule_number) => {
	// 파일 처리 및 pcapsule ID와 연결
	const voiceUrl = voiceFile.location; // multer-s3를 사용할 경우 파일 URL

	const connection = await pool.getConnection(async (conn) => conn);
	try {
		connection.beginTransaction();

		// 캡슐 존재 확인
		const isExistCapsule = await checkCapsuleNum_d(connection, capsule_number);

		if (!isExistCapsule) {
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		// pcapsuleNumber를 이용해 pcapsuleId를 찾는 함수
		const pcapsuleId = await getPcapsuleId(connection, capsule_number);

		const result = await saveVoice(connection, pcapsuleId, voiceUrl);

		await connection.commit();
		return result;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

//캡슐 조회
export const readPcs_s = async (capsuleNumber, capsulePassword) => {
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

		if (!isPasswordValid) {
			throw new BaseError(status.CAPSULE_PASSWORD_WRONG);
		}

		// 캡슐 정보 조회
		const pcapsuleData = await retrieveCapsule_d(connection, capsuleNumber);

		// 상세정보를 전부 반환하지 않고 일부만 반환
		const responseData = {
			capsule_number: pcapsuleData.capsule_number,
			pcapsule_name: pcapsuleData.pcapsule_name,
			open_date: pcapsuleData.open_date,
			dear_name: pcapsuleData.dear_name,
			theme: pcapsuleData.theme,
			// content_type 반환하도록 추가
			content_type: pcapsuleData.content_type,
			// status 반환하도록 추가
			status: pcapsuleData.status,
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
export const readDetailPcs_s = async (capsuleNumber, capsulePassword) => {
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

		if (!isPasswordValid) {
			throw new BaseError(
				status.CAPSULE_PASSWORD_WRONG,
				"패스워드가 잘못되었습니다.",
			);
		}

		// 캡슐 정보 조회
		const pcapsuleData = await retrieveCapsule_d(connection, capsuleNumber);
		// 추가된 로직: opened 상태의 캡슐만 반환
		if (pcapsuleData.status !== "OPENED") {
			throw new BaseError(status.CAPSULE_NOT_OPENED);
		}

		let text_img_data = null;
		let voice_data = null;
		let align_type = null;

		// 배열 형식으로 조회 값 저장, 반환하는 로직으로 변경
		if (pcapsuleData.content_type === 1) {
			text_img_data = await retrievetxt_img_idBypcapsule_id(
				connection,
				pcapsuleData.id,
			);

			align_type = text_img_data[0].align_type;

			text_img_data = text_img_data.map((row) => ({
				body: row.body,
				image_url: row.image_url,
			}));
		} else if (pcapsuleData.content_type === 2) {
			voice_data = await retrievevoice_idBypcapsule_id(
				connection,
				pcapsuleData.id,
			);
		}

		const retrieveData = {
			capsule_number: pcapsuleData.capsule_number,
			pcapsule_name: pcapsuleData.pcapsule_name,
			open_date: pcapsuleData.open_date,
			dear_name: pcapsuleData.dear_name,
			theme: pcapsuleData.theme,
			content_type: pcapsuleData.content_type,
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

export const updatePcapsuleStatus_s = async (capsuleNumber, newStatus) => {
	const connection = await pool.getConnection(async (conn) => conn);

	try {
		await connection.beginTransaction();

		const isExistCapsule = await checkCapsuleNum_d(connection, capsuleNumber);

		if (!isExistCapsule) {
			connection.release();
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		await updateCapsuleStatus(connection, newStatus, capsuleNumber);

		await connection.commit();

		const updatedCapsuleData = await retrieveCapsule_d(
			connection,
			capsuleNumber,
		);

		const responseData = {
			capsule_number: updatedCapsuleData.capsule_number,
			pcapsule_name: updatedCapsuleData.pcapsule_name,
			open_date: updatedCapsuleData.open_date,
			dear_name: updatedCapsuleData.dear_name,
			theme: updatedCapsuleData.theme,
			status: updatedCapsuleData.status,
		};

		return responseData;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};
