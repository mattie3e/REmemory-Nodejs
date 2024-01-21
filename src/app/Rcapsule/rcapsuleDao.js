export const checkCapsuleNum_d = async (connection, capsule_number) => {
	const query = `SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`;
	const [checkCapsuleNumRow] = await connection.query(query, capsule_number);
	return checkCapsuleNumRow[0].isExistCapsule;
};

export const insertTimeCapsule = async (connection, capsule_number, userId) => {
    const query = `INSERT INTO time_capsule (id, member_id, total_cnt, capsule_number) VALUES (NULL, ?, NULL, ?)`;
    const [insertTimeCapsuleRow] = await connection.query(query, [
        capsule_number,
        userId,
    ]);
    return insertTimeCapsuleRow[0];
};

export const insertRcapsule = async (connection, insertData) => {
    const query = `INSERT INTO rcapsule 
    (id, time_capsule_id, capsule_number, rcapsule_name, rcapsule_password, rcapsule_cnt, url, open_date, dear_name, created_at, updated_at, status)
    VALUES (NULL, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?);`;
    const [insertRcapsuleRow] = await connection.query(query, [
        ...insertData,
        new Date(),
        new Date(),
        "ACTIVE", // status
    ]);
    return insertRcapsuleRow[0];
};

export const getTimeCapsuleId = async(connection, capsule_number) => {
    const query = `SELECT id
    FROM time_capsule
    WHERE capsule_number = ?;`;
    const [result] = await connection.query(query, capsule_number);
    return result[0].id;
}