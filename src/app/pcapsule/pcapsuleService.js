// Service
import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import { createCapsuleNum_p, createContent_p } from "./pcapsuleProvider.js";
import {
	checkCapsuleNum_d,
	insertPcapsule_d,
	insertCapsuleNum_d,
	getPcs_d,
	updatePcsStatus_d,
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

// 캡슐 조회
export const getPcs_s = async (capsule_number, pcapsule_password) => {
	const pcapsule = await getPcs_d(capsule_number, pcapsule_password);
	if (!pcapsule) {
		throw new Error("Capsule not found");
	}
	// 조회할 때만 비교해서 status 변경 -> 차후 변경
	if (new Date(pcapsule.open_date) <= new Date()) {
		await updatePcsStatus_d(capsule_number, "OPENED");
		pcapsule.status = "OPENED";
	}
	if (pcapsule.status === "LOCKED") {
		return { message: "The capsule is locked." };
	} else {
		return pcapsule;
	}
};
