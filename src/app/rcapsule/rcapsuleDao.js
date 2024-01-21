// dao.js

//캡슐 번호 및 url 반환
export const getRcs_d = async(capsule_number, capsule_url) => {
    try {
        //삽입한 데이터의 id를 이용하여 조회
        const [numNUrl] = await Connection.query(
            'SELECT capsule_number, url FROM rcapsule WHERE id = ?;',
            [rcapsule_id]
        );

        return numNUr[0]; //조회된 데이터 반환
        }catch (error){
            throw error;
        }
};