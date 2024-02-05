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
