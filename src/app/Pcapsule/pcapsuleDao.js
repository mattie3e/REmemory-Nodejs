export const insertPcapsule_d = async (connection, data) => {
	const query = `INSERT INTO pcapsule 
    (time_capsule_id, capsule_number, pcapsule_password, pcapsule_name, open_date, dear_name, theme, content_type, status, created_at, updated_at) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
	const [insertPcapsuleRow] = await connection.query(query, [
		...data,
		"LOCKED", // status 추가
		new Date(),
		new Date(),
	]);
	return insertPcapsuleRow.insertId; //, ...insertPcapsuleRow[0] };
};
///////
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

export const insertCapsuleNum_d = async (
	connection,
	capsule_number,
	member_id,
) => {
	//member_id 있어야합니다. 어디선가 로그인되어 있는 현재 유저의 memeber id 가져와서 같이 넣어줘야 해요.
	const query = `INSERT INTO time_capsule (member_id, capsule_number, total_cnt) VALUES (?,?,?);`;
	const [insertTimeCapsuleRow] = await connection.query(query, [
		member_id,
		capsule_number,
		1,
	]); //total_cnt는 그냥 1넣었는데 나중에 수정해야해요.
	return insertTimeCapsuleRow.insertId;
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

//유저id로 pcapsule 가져오기
export const getPcapsulesByUserId = async (connection, userId) => {
	const query = `SELECT capsule_number FROM pcapsule WHERE capsule_number LIKE ?`;
	const userCapsules = await connection.query(query, [`${userId}%`]);
	return userCapsules;
};

//삭제(status 바꾸기)
export const updateCapsuleStatus = async (
	connection,
	status,
	capsule_number,
) => {
	const query = "UPDATE pcapsule SET status = ? WHERE capsule_number = ?";
	await connection.query(query, [status, capsule_number]);
};

export const retrieveCapsule_d = async (connection, capsule_number) => {
	const query = `SELECT * FROM pcapsule WHERE capsule_number = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, capsule_number);
	return retrieveCapsuleRow[0];
};

export const retrievetxt_img_idBypcapsule_id = async (
	connection,
	pcapsule_id,
) => {
	const query = `SELECT * FROM text_image WHERE pcapsule_id = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, pcapsule_id);
	// 모든 행 가져오도록 변경
	return retrieveCapsuleRow;
};

export const retrievevoice_idBypcapsule_id = async (
	connection,
	pcapsule_id,
) => {
	const query = `SELECT * FROM voice WHERE pcapsule_id = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, pcapsule_id);
	return retrieveCapsuleRow[0];
};

export const checkPasswordValidity = async (
	connection,
	capsuleNumber,
	capsulePassword,
) => {
	const query = `SELECT EXISTS(SELECT 1 FROM pcapsule WHERE capsule_number = ? AND pcapsule_password = ?) as isValidPassword;`;
	const [passwordResult] = await connection.query(query, [
		capsuleNumber,
		capsulePassword,
	]);
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
export const saveTextImage = async (
	connection,
	pcapsule_id,
	body,
	image_url,
	align_type,
) => {
	const query = `INSERT INTO text_image (pcapsule_id, body, image_url, align_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		pcapsule_id,
		body,
		image_url,
		align_type,
		new Date(),
		new Date(),
	]);
	return result.insertId;
};

export const saveVoice = async (connection, pcapsule_id, voice_url) => {
	const query = `INSERT INTO voice (pcapsule_id, voice_url, created_at, updated_at) VALUES (?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		pcapsule_id,
		voice_url,
		new Date(),
		new Date(),
	]);
	return result.insertId;
};
