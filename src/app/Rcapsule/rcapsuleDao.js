// dao.js

export const getRcapsuleId = async (connection, capsule_number) => {
	const query = `SELECT id FROM rcapsule WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, capsule_number);
	console.log("getRcapsuleId : ", result[0]);
	return result[0].id;
};

export const getWriterId = async (connection, rcapsule_id) => {
	const query = `SELECT id FROM rcapsule_writer WHERE rcapsule_id = ?;`;
	const [result] = await connection.query(query, rcapsule_id);
	console.log("getWriterId", result[0]);
	return result[0].id;
};

//캡슐 번호 및 url 조회
export const readNumNUrl_d = async (connection, capsuleNumber) => {
	//삽입한 데이터의 id를 이용하여 조회
	const query =
		"SELECT capsule_number, url FROM rcapsule WHERE capsule_number = ?;";
	const [resNumNurl] = await connection.query(query, [capsuleNumber]);
	//결과 반환
	return resNumNurl[0];
};

// checkCapsulNum_d
export const checkCapsuleNum_d = async (connection, capsuleNumber) => {
	const query = `SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`;
	const [checkCapsuleNumRow] = await connection.query(query, capsuleNumber);
	return checkCapsuleNumRow[0].isExistCapsule;
};

// 보내는 사람 조회하기 *query문 확인 ..
export const readDear_d = async (connection, capsuleNumber) => {
	const query = "SELECT dear_name, id FROM rcapsule WHERE capsule_number = ?";
	const [resdata] = await connection.query(query, [capsuleNumber]);
	//결과 반환
	return resdata[0];
};

//createText_d
//body : from_name, content_type, image_url, body
export const addTextImage_d = async (connection, imageurl, writer_id, text) => {
	const query = `INSERT INTO text_image (id, pcapsule_id, rwcapsule_id, body, image_url, created_at, updated_at)
VALUES (null, null, ?, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		writer_id,
		text,
		imageurl,
		new Date(),
		new Date(),
	]);
	console.log("addTextImage_d : ", result[0]);
	return result[0];
};

//theme이 왜 안 들어가 있는지..? -> 보류
// export const setRcapsuleWriter = async (
//    connection,
//    rcapsule_id,
//    from_name,
//    content_type,
// ) => {
//    const query = `INSERT INTO rcapsule_writer (id, rcapsule_id, from_name, content_type, created_at, updated_at)
// VALUES (null, ?, ?, ?, ?);`;
//    const [result] = await connection.query(query, [
//       rcapsule_id,
//       from_name,
//       content_type,
//       new Date(),
//       new Date(),
//    ]);
//    return result[0];
// };

export const insertTimeCapsule = async (connection, capsule_number, userId) => {
	const query = `INSERT INTO time_capsule (id, member_id, total_cnt, capsule_number) VALUES (NULL, ?, 0, ?);`;
	const [insertTimeCapsuleRow] = await connection.query(query, [
		userId,
		capsule_number,
	]);
	console.log(insertTimeCapsuleRow[0]);
	return insertTimeCapsuleRow[0];
};

export const getTimeCapsuleId = async (connection, capsule_number) => {
	const query = `SELECT id
FROM time_capsule
WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, capsule_number);
	return result[0].id;
};

export const insertRcapsule = async (connection, insertData) => {
	const query = `INSERT INTO rcapsule 
 (id, time_capsule_id, capsule_number, rcapsule_name, rcapsule_password, rcapsule_cnt, url, open_date, dear_name, theme, status, created_at, updated_at)
 VALUES (NULL, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?);`;
	const [insertRcapsuleRow] = await connection.query(query, [
		...insertData,
		"LOCKED", // status
		new Date(),
		new Date(),
	]);
	return insertRcapsuleRow[0];
};

export const updatePassword = async (
	connection,
	rcapsule_password,
	rcapsule_id,
) => {
	console.log(
		"rcapsuleDao.js, rcs_pw : ",
		rcapsule_password,
		"\nrcapsule_id : ",
		rcapsule_id,
	);
	const query = `UPDATE rcapsule SET rcapsule_password = ?, updated_at = ? WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, [
		rcapsule_password,
		new Date(),
		rcapsule_id,
	]);
	console.log("쿼리문 실행 결과 : ", result);
	return result[0];
};

export const setRcapsuleWriter_n = async (
	connection,
	rcapsule_id,
	from_name,
	theme,
	content_type,
) => {
	const query = `INSERT INTO rcapsule_writer (id, rcapsule_id, from_name, theme, content_type, created_at, updated_at) 
VALUES (null, ?, ?, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		rcapsule_id,
		from_name,
		theme,
		content_type,
		new Date(),
		new Date(),
	]);
	console.log("setRcapsuleWriter_n : ", result[0]);
	return result[0];
};

export const addVoiceLetter_d = async (connection, voiceUrl, writer_id) => {
	const query = `INSERT INTO voice (id, pcapsule_id, rwcapsule_id, voice_url, created_at, updated_at)
VALUES (null, null, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		writer_id,
		voiceUrl,
		new Date(),
		new Date(),
	]);
	console.log("addVoiceLetter_d", result[0]);
	return result[0];
};

export const updateOpenedStatus_d = async (connection) => {
	const query = `UPDATE rcapsule SET status = 'OPENED', updated_at = NOW() WHERE open_date <= CURDATE() AND status = 'LOCKED';`;
	const [result] = await connection.query(query);

	if (result.changedRows > 0) {
		//변경된 행이 있을 경우 메일 발송
		sendNotificationEmail();
	}
	return result;
};

export const checkUpdatedRows = async (connection, oneDayAgo) => {
	const query = `SELECT capsule_number, rcapsule_name, rcapsule_password FROM rcapsule WHERE status = 'OPENED' AND updated_at >= ?;`;

	const [rows] = await connection.query(query, [oneDayAgo]);

	return rows;
};

export const getUserEmail = async (connection, capsule_number) => {
	const query = `SELECT m.email AS userEmail
FROM member AS m
JOIN time_capsule AS tc ON m.id = tc.member_id
WHERE tc.capsule_number = ?;`;

	const [result] = await connection.query(query, [capsule_number]);

	return result[0].userEmail;
};

export const checkRcapsule_d = async (connection, capsule_number) => {
	const query = `SELECT CASE WHEN EXISTS (
     SELECT capsule_number FROM rcapsule WHERE capsule_number = ?
 ) THEN 1 ELSE 0 END AS RESULT;`;

	const [result] = await connection.query(query, [capsule_number]);
	// console.log(result[0]); //-> [ { RESULT: 0 } ] 형태로 옴
	return result[0].RESULT;
};

// 조회 관련 추가 코드들

export const checkPasswordValidity = async (
	connection,
	capsuleNumber,
	capsulePassword,
) => {
	const query = `SELECT EXISTS(SELECT 1 FROM rcapsule WHERE capsule_number = ? AND rcapsule_password = ?) as isValidPassword;`;
	const [passwordResult] = await connection.query(query, [
		capsuleNumber,
		capsulePassword,
	]);
	return passwordResult[0].isValidPassword;
};

export const retrieveCapsule_d = async (connection, capsule_number) => {
	const query = `SELECT * FROM rcapsule WHERE capsule_number = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, capsule_number);
	return retrieveCapsuleRow[0];
};
