// dao.js

export const getRcapsuleId = async (connection, capsule_number) => {
	const query = `SELECT id FROM rcapsule WHERE capsule_number = ?;`;
	const [result] = await connection.query(query, capsule_number);
	return result[0].id;
};

export const getWriterId = async (connection, rcapsule_id) => {
	const query = `SELECT id FROM rcapsule_writer WHERE rcapsule_id = ?;`;
	const [result] = await connection.query(query, rcapsule_id);
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
export const addTextImage_d = async (connection, image_url, writer_id) => {
	const query = `INSERT INTO voice (id, pcapsule_id, rwcapsule_id, image_url, created_at, updated_at)
  VALUES (null, null, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		writer_id,
		voiceUrl,
		new Date(),
		new Date(),
	]);
};

//theme이 왜 안 들어가 있는지..? -> 보류
export const setRcapsuleWriter = async (
	connection,
	rcapsule_id,
	from_name,
	content_type,
) => {
	const query = `INSERT INTO rcapsule_writer (id, rcapsule_id, from_name, content_type, created_at, updated_at) 
  VALUES (null, ?, ?, ?, ?);`;
	const [result] = await connection.query(query, [
		rcapsule_id,
		from_name,
		content_type,
		new Date(),
		new Date(),
	]);
	return result[0];
};

export const insertTimeCapsule = async (connection, capsule_number, userId) => {
    const query = `INSERT INTO time_capsule (id, member_id, total_cnt, capsule_number) VALUES (NULL, ?, NULL, ?)`;
    const [insertTimeCapsuleRow] = await connection.query(query, [
        capsule_number,
        userId,
    ]);
    return insertTimeCapsuleRow[0];
};

export const getTimeCapsuleId = async(connection, capsule_number) => {
    const query = `SELECT id
    FROM time_capsule
    WHERE capsule_number = ?;`;
    const [result] = await connection.query(query, capsule_number);
    return result[0].id;
};

export const insertRcapsule = async (connection, insertData) => {
    const query = `INSERT INTO rcapsule 
    (id, time_capsule_id, capsule_number, rcapsule_name, rcapsule_password, rcapsule_cnt, url, open_date, dear_name, created_at, updated_at, status)
    VALUES (NULL, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?);`;
    const [insertRcapsuleRow] = await connection.query(query, [
        ...insertData,
        new Date(),
        new Date(),
        "LOCKED", // status
    ]);
    return insertRcapsuleRow[0];
};

export const updatePassword = async(connection, rcapsule_password, rcapsule_id) => {
    const query = `UPDATE rcapsule SET rcapsule_password = ?, updated_at = ? WHERE id = ?;`;
    const [result] = await connection.query(query, [
        rcapsule_password,
        new Date(),
        rcapsule_id,
    ]);
    return result[0];
};

export const setRcapsuleWriter_n = async (connection, rcapsule_id, from_name, theme, content_type) => {
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
    ])
};

export const updateOpenedStatus_d = async (connection) => {
    const query = `UPDATE rcapsule SET status = 'OPENED', updated_at = NOW() WHERE open_date <= CURDATE() AND status = 'LOCKED';`;
    const [result] = await connection.query(query);
    
    if (result.affectedRows > 0) {
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