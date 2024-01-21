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

// X
// export const readCapsuleCnt_d = async(connection, rCapsuleNumber) => {
//     const query = 'SELECT capsule_cnt FROM rcapsule WHERE capsule_number = ?'
//     const resCnt = await connection.query(query, [rCapsuleNumber]);

//     //결과 반환
//     return { capsule_cnt: resCnt[0].capsule_cnt, };
// }