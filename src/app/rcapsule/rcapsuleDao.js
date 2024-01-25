// dao.js

//캡슐 번호 및 url 조회
export const readNumNUrl_d = async(connection, capsuleNumber) => {
        //삽입한 데이터의 id를 이용하여 조회
        const query = 'SELECT capsule_number, url FROM rcapsule WHERE capsule_number = ?;'
        const [resNumNurl] = await connection.query(query, [capsuleNumber]);

        //결과가 존재하지 않으면 null 반환 (캡슐 생성 X) * 추가
        if (resNumNUrl.length === 0 ){
            return null;
        }
        //결과 반환
        return resNumNurl[0];
};

export const readDear_d = async(connection, capsuleNumber) => {
    const query = 'SELECT dear_name, id FROM rcapsule WHERE capsule_number = ?'
    const [resdata] = await connection.query(query, [capsuleNumber]);
    //결과가 존재하지 않으면 null 반환 (캡슐 생성 X) * 추가
    if (resdata.length === 0 ){
        return null;
    }
    //결과 반환
    return resdata[0];
};

//body : from_name, content_type, image_url, body
export const createText_d = async(connection, body) => {
    const {from_name, content_type, image_url, body: textBody} = body;

    await connection.beginTransaction();

    //쿼리 작성하기(from_name, content_type)
    const writerQuery = `INSERT INTO rcapsule_writer (from_name, content_type) VALUES (?, ?)`

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