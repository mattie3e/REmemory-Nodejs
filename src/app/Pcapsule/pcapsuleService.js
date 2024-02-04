// Service
import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { createCapsuleNum_p, createContent_p } from "./pcapsuleProvider.js";
import {
	checkCapsuleNum_d,
	insertPcapsule_d,
	insertCapsuleNum_d,
	retrieveCapsule_d,
	checkPasswordValidity,
	retrieveText_image,
	retrieveVoice,
	updateCapsuleStatus,
} from "./pcapsuleDao.js";

// 캡슐 생성
export const createPcs_s = async (body, nickname) => {
	const { pcapsule_name, open_date, dear_name, theme, content_type, content } =
		body;
	const requiredFields = [
		"pcapsule_name",
		"open_date",
		"dear_name",
		"theme",
		"content_type",
		"content", // 글사진 or 음성 데이터
	];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	const capsule_number = await createCapsuleNum_p(nickname);

	const { text_image_id, voice_id } = await createContent_p(
		content_type,
		content,
	);

	const connection = await pool.getConnection(async (conn) => conn);

	try {
		connection.beginTransaction();

		const isExistCapsule = await checkCapsuleNum_d(connection, capsule_number);

		if (isExistCapsule) {
			connection.release();
			throw new BaseError(status.CAPSULE_NOT_FOUND);
		}

		await insertCapsuleNum_d(connection, capsule_number);

		const insertData = [
			capsule_number,
			pcapsule_name,
			open_date,
			dear_name,
			theme,
			content_type,
			content_type === 1 ? text_image_id : null,
			content_type === 2 ? voice_id : null,
		];
		const createPcsData = await insertPcapsule_d(connection, insertData);

		await connection.commit();

		return { ...createPcsData, capsule_number };
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
		console.log(isExistCapsule);

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

		const responseData = {
			capsule_number: pcapsuleData.capsule_number,
			pcapsule_name: pcapsuleData.pcapsule_name,
			open_date: pcapsuleData.open_date,
			dear_name: pcapsuleData.dear_name,
			theme: pcapsuleData.theme,
			// 상세정보를 전부 반환하지 않고 일부만 반환
		};

		await connection.commit();

		res.send(
			response(status.SUCCESS, {
				pcapsule: responseData,
			}),
		);
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
			throw new BaseError(status.CAPSULE_PASSWORD_WRONG);
		}

		// 캡슐 정보 조회
		const pcapsuleData = await retrieveCapsule_d(connection, capsuleNumber);

		const retrieveData = {
			capsule_number: pcapsuleData.capsule_number,
			pcapsule_name: pcapsuleData.pcapsule_name,
			open_date: pcapsuleData.open_date,
			dear_name: pcapsuleData.dear_name,
			theme: pcapsuleData.theme,
			content_type: pcapsuleData.content_type,
			text_image_id: pcapsuleData.text_image_id,
			voice_id: pcapsuleData.voice_id,
		};

		//content 가져오기
		if (pcapsuleData.content_type == 1 && pcapsuleData.text_image_id) {
			const textImageData = await retrieveText_image(
				connection,
				pcapsuleData.text_image_id,
			);

			if (textImageData.length > 0) {
				// text_image_id에 해당하는 데이터가 존재하는 경우

				retrieveData.text_image_body = textImageData.body;
				retrieveData.text_image_url = textImageData.image_url;
			} else {
				throw new BaseError(status.TEXT_IMAGE_NOT_FOUND);
			}
		}

		if (pcapsuleData.content_type == 2 && pcapsuleData.voice_id) {
			const voiceData = await retrieveVoice(connection, pcapsuleData.voice_id);

			if (voiceData.length > 0) {
				// voice_id에 해당하는 데이터가 존재하는 경우

				retrieveData.voice_url = voiceData.voice_url;
			} else {
				throw new BaseError(status.VOICE_NOT_FOUND);
			}
		}

		await connection.commit();

		res.send(
			response(status.SUCCESS, {
				pcapsule: retrieveData,
			}),
		);
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

        await updateCapsuleStatus(newStatus,capsuleNumber);


        await connection.commit();

        const updatedCapsuleData = await retrieveCapsule_d(connection, capsuleNumber);

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