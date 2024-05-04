// dao.js

export const getRcapsuleId = async (connection, capsule_number) => {
	const query = `SELECT id FROM rcapsule WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, capsule_number);
	return result[0].id;
};

export const getWriterId = async (
	connection,
	rcapsule_id,
	from_name,
	content_type,
) => {
	const query = `SELECT id FROM rcapsule_writer WHERE rcapsule_id = ? AND from_name = ? AND content_type = ?;`;
	const [result] = await connection.query(query, [
		rcapsule_id,
		from_name,
		content_type,
	]);
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
	const query =
		"SELECT dear_name, id, theme FROM rcapsule WHERE capsule_number = ?";
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

	return result[0];
};

export const insertTimeCapsule = async (connection, capsule_number, userId) => {
	const query = `INSERT INTO time_capsule (id, member_id, total_cnt, capsule_number) VALUES (NULL, ?, 0, ?);`;
	const [insertTimeCapsuleRow] = await connection.query(query, [
		userId,
		capsule_number,
	]);

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
	const status = ["LOCKED", "OPENED"];

	let openDate = new Date(insertData[4]);
	console.log("openData: ", openDate);

	let now = new Date();

	const timeOffset = now.getTimezoneOffset() * 60000; // 현재 시간대와 UTC의 차이(밀리초)
	const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
	const curDate = new Date(now.getTime() + timeOffset + kstOffset);
	console.log("curDate: ", curDate);

	// 날짜만 비교하기 위해 시간을 제거
	openDate.setHours(0, 0, 0, 0);
	curDate.setHours(0, 0, 0, 0);
	console.log("openData: ", openDate);
	console.log("curDate: ", curDate);
	console.log("now: ", now);

	const query = `INSERT INTO rcapsule 
(time_capsule_id, capsule_number, rcapsule_name, rcapsule_password, url, open_date, dear_name, theme, status, created_at, updated_at)
VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?);`;
	const [insertRcapsuleRow] = await connection.query(query, [
		...insertData,
		openDate.getTime() === curDate.getTime() ? status[1] : status[0],
		curDate,
		curDate,
	]);
	return insertRcapsuleRow[0];
};

export const updatePassword = async (
	connection,
	rcapsule_password,
	rcapsule_id,
) => {
	const query = `UPDATE rcapsule SET rcapsule_password = ?, updated_at = ? WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, [
		rcapsule_password,
		new Date(),
		rcapsule_id,
	]);

	return result[0];
};

export const setRcapsuleWriter_n = async (
	connection,
	rcapsule_id,
	from_name,
	content_type,
) => {
	const query = `INSERT INTO rcapsule_writer (rcapsule_id, from_name, content_type, created_at, updated_at) 
  VALUES (?, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		rcapsule_id,
		from_name,
		content_type,
		new Date(),
		new Date(),
	]);

	return result.insertId;
};

export const addVoiceLetter_d = async (connection, voiceUrl, writer_id) => {
	const query = `INSERT INTO voice (rwcapsule_id, voice_url, created_at, updated_at)
VALUES (?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		writer_id,
		voiceUrl,
		new Date(),
		new Date(),
	]);
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
SELECT capsule_number FROM rcapsule WHERE capsule_number = ?) THEN 1 ELSE 0 END AS RESULT;`;

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

	const cntQuery = `SELECT COUNT(*) FROM rcapsule_writer WHERE rcapsule_id IN (SELECT id FROM rcapsule WHERE capsule_number = ?)`;
	const [retrieveCapsuleCnt] = await connection.query(cntQuery, capsule_number);

	return [retrieveCapsuleRow[0], retrieveCapsuleCnt[0]["COUNT(*)"]];
};

export const saveTextImage_rcs = async (
	connection,
	rwcapsule_id,
	body,
	image_url,
	align_type,
) => {
	const query = `INSERT INTO text_image (rwcapsule_id, body, image_url, align_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		rwcapsule_id,
		body,
		image_url,
		align_type,
		new Date(),
		new Date(),
	]);

	return result.insertId;
};

//상세조회를 위한 롤링페이퍼 목록을 조회
export const getRollingPaperList = async (connection, rcapsule_id) => {
	const query = `SELECT id AS writer_id, from_name, content_type FROM rcapsule_writer WHERE rcapsule_id = ?;`;
	const [result] = await connection.query(query, [rcapsule_id]);

	return result;
};

export const getRcapsuleUrl = async (connection, capsule_number) => {
	const query = `SELECT url FROM rcapsule WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, [capsule_number]);

	return result[0].url;
};

export const checkWid_d = async (connection, wId) => {
	const query = `SELECT EXISTS(SELECT 1 FROM rcapsule_writer WHERE id = ?) as isExistW;`;
	const [checkW] = await connection.query(query, wId);
	return checkW[0].isExistW;
};

export const getRcsWContentType = async (connection, wId) => {
	const query = `SELECT id, content_type, from_name FROM rcapsule_writer WHERE id =?`;
	const [Winfo] = await connection.query(query, wId);
	return Winfo[0];
};

export const retrievetxt_img_idBypcapsule_id = async (connection, wId) => {
	const query = `SELECT * FROM text_image WHERE rwcapsule_id = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, wId);
	// 모든 행 가져오도록 변경
	return retrieveCapsuleRow;
};

export const retrievevoice_idBypcapsule_id = async (connection, wId) => {
	const query = `SELECT * FROM voice WHERE rwcapsule_id = ?`;
	const [retrieveCapsuleRow] = await connection.query(query, wId);
	return retrieveCapsuleRow[0];
};

export const getRcapsuleInfo = async (connection, rcapsule_id) => {
	const query = `SELECT theme, dear_name, rcapsule_name FROM rcapsule WHERE id = ?;`;
	const [result] = await connection.query(query, [rcapsule_id]);

	return result[0];
};

export const checkRcapsulePw = async (connection, capsule_number) => {
	const query = `SELECT IFNULL((SELECT 1 FROM rcapsule WHERE capsule_number = ? AND rcapsule_password IS NOT NULL), 0) AS password_existence;`;
	const [result] = await connection.query(query, [capsule_number]);

	return result[0].password_existence;
};
