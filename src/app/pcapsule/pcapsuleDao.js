export const insertPcapsule = async (connection, data) => {
	const query = `INSERT INTO pcapsule (capsule_number, pcapsule_name, open_date, dear_name, theme, content_type, text_image_id, voice_id) VALUES (?,?,?,?,?,?,?,?);`;
	const [insertPcapsuleRow] = await connection.query(query, data);
	return insertPcapsuleRow[0];
};

export const insertCapsuleNumber = async (connection, capsule_number) => {
	const query = `INSERT INTO time_capsule (capsule_number) VALUES (?);`;
	const [insertTimeCapsuleRow] = await connection.query(query, capsule_number);
	return insertTimeCapsuleRow[0];
};

export const checkCapsuleNum_d = async (connection, capsule_number) => {
	const query = `SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`;
	const [checkCapsuleNumRow] = await connection.query(query, capsule_number);
	return checkCapsuleNumRow[0].isExistCapsule;
};

// 이건 공통으로 사용될거같은데 공통으로 사용되는 함수들 파일 필요할듯
export const saveTextImage = async (connection, body, image_url, sort) => {
	const query = `INSERT INTO text_image (body, image_url, sort) VALUES (?, ?, ?);`;
	const [result] = await connection.query(query, [body, image_url, sort]);
	return result.insertId;
};

export const saveVoice = async (connection, voice_url) => {
	const query = `INSERT INTO voice (voice_url) VALUES (?);`;
	const [result] = await connection.query(query, voice_url);
	return result.insertId;
};
