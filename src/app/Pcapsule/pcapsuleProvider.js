import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import {
	savePassword_d,
	saveTextImage,
	saveVoice,
	updateOpenedStatus_d,
	checkCapsuleNum_d,
} from "./pcapsuleDao.js";

// 캡슐넘버 생성
export const createCapsuleNum_p = async (nickname) => {
	const connection = await pool.getConnection(async (conn) => conn);
	let capsule_number;

	while (true) {
		const random_number = Math.floor(Math.random() * 100000 + 1); // 1~100000 사이의 랜덤 숫자
		capsule_number = `${nickname}_${random_number}`;
		const isExistCapsule = await checkCapsuleNum_d(connection, capsule_number);
		if (!isExistCapsule) {
			break;
		}
	}
	connection.release();
	return capsule_number;
};

// 캡슐 비밀번호 추가
export const savePassword_p = async (capsule_number, pcapsule_password) => {
	const connection = await pool.getConnection(async (conn) => conn);
	try {
		connection.beginTransaction();

		await savePassword_d(connection, capsule_number, pcapsule_password);
		await connection.commit();

		return { message: "Password saved successfully." };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

// // text_image or voice data 생성
// export const createContent_p = async (
//    content_type,
//    contents,
//    pcapsule_id,
//    align_type,
//    voiceFile, // multer를 통해 받은 파일
// ) => {
//    const connection = await pool.getConnection(async (conn) => conn);

//    let text_image_id = null;
//    let voice_id = null;

//    try {
//       if (content_type === 1) {
//          // 프론트 예시
//          // contents:
//          //  [
//          //    {type: 'text', content: '안녕'},
//          //    {type: 'image', content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMA…kakDsHxpPTEAbA/7800saP21M9FC5t1EGAAAAAElFTkSuQmCC'},
//          //    {type: 'image', content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMA…kakDsHxpPTEAbA/7800saP21M9FC5t1EGAAAAAElFTkSuQmCC'},
//          //    {type: 'text', content: '이 사진 기억나?'}
//          //  ]
//          for (let i = 0; i < contents.length; i++) {
//             const value = contents[i];
//             if (value.type === "text") {
//                text_image_id = await saveTextImage(
//                   connection,
//                   pcapsule_id,
//                   value.content, // 텍스트인 경우 content를 사용
//                   null, // 이미지인 경우 null로 처리
//                   align_type, // align_type 전달
//                );
//             } else if (value.type === "image") {
//                text_image_id = await saveTextImage(
//                   connection,
//                   pcapsule_id,
//                   null, // 텍스트인 경우 null로 처리
//                   value.content, // 이미지인 경우 content를 사용
//                   align_type, // align_type 전달
//                );
//             }
//             if (!text_image_id) throw new Error("Failed to save text content");
//          }
//       } else if (content_type === 2) {
//          const voice_url = voiceFile.location; // multer로부터 받은 파일의 URL
//          voice_id = await saveVoice(connection, pcapsule_id, voice_url);
//       }

//       await connection.commit();
//    } catch (error) {
//       await connection.rollback();
//       throw error;
//    } finally {
//       connection.release();
//    }

//    return { text_image_id, voice_id };
// };

// 캡슐 상태변경
export const updateOpenedStatus_p = async () => {
	await updateOpenedStatus_d();
};

//유저의 capsule list 가져오기
export const getUserCapsules_p = async (user_id) => {
	const connection = await pool.getConnection(async (conn) => conn);

	try {
		const userId = user_id;
		const data = await getPcapsulesByUserId(connection, userId);

		console.log(data);

		return data;
	} catch (error) {
		console.error("Error in getUserCapsules_p:", error);
		throw error;
	} finally {
		if (connection) {
			connection.release();
		}
	}
};
