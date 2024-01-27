// dao.js

//캡슐 번호 및 url 조회
export const readNumNUrl_d = async(connection, capsuleNumber) => {
        //삽입한 데이터의 id를 이용하여 조회
        const query = 'SELECT capsule_number, url FROM rcapsule WHERE capsule_number = ?;'
        const [resNumNurl] = await connection.query(query, [capsuleNumber]);
        //결과 반환
        return resNumNurl[0];
};

// checkCapsulNum_d
export const checkCapsuleNum_d = async(connection, capsuleNumber) => {
    const query = `SELECT EXISTS(SELECT 1 FROM time_capsule WHERE capsule_number = ?) as isExistCapsule;`;
    const [checkCapsuleNumRow] = await connection.query(query, capsuleNumber);
    return checkCapsuleNumRow[0].isExistCapsule;
}

// 보내는 사람 조회하기 *query문 확인 ..
export const readDear_d = async(connection, capsuleNumber) => {
    const query = 'SELECT dear_name, id FROM rcapsule WHERE capsule_number = ?'
    const [resdata] = await connection.query(query, [capsuleNumber]);
    //결과 반환
    return resdata[0];
};

//createText_d
//body : from_name, content_type, image_url, body
export const createText_d = async(connection, body) => {
    const {from_name, content_type, image_url, body: textBody} = body;

    await connection.beginTransaction();

    //쿼리 작성하기(from_name, content_type) *여기도 쿼리문 체크
    const writerQuery = `INSERT INTO rcapsule_writer (from_name, content_type) VALUES (?, ?)`;

    const [writerResult] = await connection.query(writerQuery, [
        from_name,
        content_type,
    ]);
    const writerId = writerResult.insertId;

    //쿼리 작성하기(image_url, textBody)
    const textImageQuery = `INSERT INTO text_image (image_url, body, rwcapsule_id)
        VALUES (?, ?, ?)`;
        
    const [textImageResult] = await connection.query(textImageQuery, [
        image_url,
        textBody,
        writerId,
    ]);
    const textImageId = textImageResult.insertId;

    await connection.commit();

    return {
        rcapsule_writer_id: writerId,
        text_image_id: textImageId,
        from_name,
        content_type,
        image_url,
        body: textBody,
    };
}