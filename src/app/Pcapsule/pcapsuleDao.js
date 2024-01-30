export const insertPcapsule_d = async (connection, data) => {
	const query = `INSERT INTO pcapsule 
    (capsule_number, pcapsule_name, open_date, dear_name, theme, content_type, 
      text_image_id, voice_id, created_at, updated_at, status) 
    VALUES (?,?,?,?,?,?,?,?,?,?);`;
	const [insertPcapsuleRow] = await connection.query(query, [
		...data,
		new Date(),
		new Date(),
		"LOCKED", // status 추가
	]);
	return insertPcapsuleRow[0];
};

// 캡슐 비밀번호 생성
export const savePassword_d = async (
	connection,
	capsule_number,
	pcapsule_password,
) => {
	const query = `UPDATE pcapsule SET pcapsule_password = ? WHERE capsule_number = ?;`;
	const [updatePasswordRow] = await connection.query(query, [
		pcapsule_password,
		capsule_number,
	]);
	return updatePasswordRow[0];
};

export const insertCapsuleNum_d = async (connection, capsule_number) => {
	const query = `INSERT INTO time_capsule (capsule_number) VALUES (?);`;
	const [insertTimeCapsuleRow] = await connection.query(query, capsule_number);
	return insertTimeCapsuleRow[0];
};

export const checkCapsuleNum_d = async (connection, capsule_number) => {
	const query = `SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`;
	const [checkCapsuleNumRow] = await connection.query(query, capsule_number);
	return checkCapsuleNumRow[0].isExistCapsule;
};

export const updateOpenedStatus_d = async () => {
	const query = `UPDATE pcapsule SET status = 'OPENED' WHERE open_date <= CURDATE() AND status = 'LOCKED';`;
	await connection.query(query);
};

export const retrieveCapsule_d = async (connection, capsule_number) => {
	const query = `SELECT * FROM pcapsule WHERE capsule_number = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, capsule_number);
	return retrieveCapsuleRow[0];
};

export const checkPasswordValidity = async (
	connection,
	capsuleNumber,
	capsulePassword,
) => {
	const query = `SELECT EXISTS(SELECT 1 FROM pcapsule WHERE capsule_number = ? AND password = ?) as isValidPassword;`;
	const [passwordResult] = await connection.query(
		query,
		capsuleNumber,
		capsulePassword,
	);
	return passwordResult[0].isValidPassword;
};

export const retrieveText_image = async (connection, text_image_id) => {
	const query =
		"SELECT body, image_url FROM text_image WHERE text_image_id = ?";
	const [retrieveText_imageRow] = await connection.query(query, text_image_id);
	return retrieveText_imageRow[0];
};

export const retrieveVoice = async (connection, voice_id) => {
	const query = "SELECT voice_url FROM voice WHERE voice_id = ?";
	const [retrieveVoiceRow] = await connection.query(query, voice_id);
	return retrieveVoiceRow[0];
};

// 이건 공통으로 사용될거같은데 공통으로 사용되는 함수들 파일 필요할듯
export const saveTextImage = async (connection, body, image_url, sort) => {
	const query = `INSERT INTO text_image (body, image_url, sort, created_at, updated_at) VALUES (?, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		body,
		image_url,
		sort,
		new Date(),
		new Date(),
	]);
	return result.insertId;
};

export const saveVoice = async (connection, voice_url) => {
	const query = `INSERT INTO voice (voice_url, created_at, updated_at) VALUES (?, ?, ?);`;
	const [result] = await connection.query(query, [
		voice_url,
		new Date(),
		new Date(),
	]);
	return result.insertId;
};
