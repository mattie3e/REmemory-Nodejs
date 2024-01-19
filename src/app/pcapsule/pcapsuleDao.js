import { pool } from "../../../config/dbConfig.js";

export const createPcs_d = async (data) => {
	const {
		pcapsule_name,
		open_date,
		dear_name,
		theme,
		content_type,
		text_image_id,
		voice_id,
		capsule_number,
	} = data;
	const conn = await pool.getConnection();

	// time_capsule 테이블에 capsule_number가 이미 존재하는지 확인
	const [confirmTimeCapsule] = await conn.query(
		`SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`,
		[capsule_number],
	);

	if (confirmTimeCapsule[0].isExistCapsule) {
		conn.release();
		return -1;
	}

	await conn.query(`INSERT INTO time_capsule (capsule_number) VALUES (?);`, [
		capsule_number,
	]);

	const result = await conn.query(
		`INSERT INTO pcapsule (capsule_number, pcapsule_name, open_date, dear_name, theme, content_type, text_image_id, voice_id) VALUES (?,?,?,?,?,?,?,?);`,
		[
			capsule_number,
			pcapsule_name,
			open_date,
			dear_name,
			theme,
			content_type,
			text_image_id,
			voice_id,
		],
	);

	conn.release();
	return result;
};

export const createCapsuleNum_d = async (nickname) => {
	const conn = await pool.getConnection();
	while (true) {
		const random_number = Math.floor(Math.random() * 100000 + 1); // 1~100000 사이의 랜덤 숫자
		const capsule_number = `${nickname}_${random_number}`;

		const [confirmTimeCapsule] = await conn.query(
			`SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`,
			[capsule_number],
		);

		if (!confirmTimeCapsule[0].isExistCapsule) {
			conn.release();
			return capsule_number;
		}
	}
};
