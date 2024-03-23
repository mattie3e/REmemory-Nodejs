import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";
import {
	getCapsule,
	getCapsuleType,
	updateOpenDate_d,
	checkUpdatedRows,
	getUserEmail,
} from "./capsuleDao.js";
import { pool } from "../../../config/dbConfig.js";
import transporter from "../../../config/nodemailer.js";

export const getUserCapsules = async (userId) => {
	const capsules = await getCapsule(userId);

	const userCapsules = [];
	capsules.forEach((item) => {
		if (item.rcapsule_name != null) {
			userCapsules.push({
				capsule_number: item.capsule_number,
				capsule_name: item.rcapsule_name,
				theme: item.RT,
			});
		} else {
			userCapsules.push({
				capsule_number: item.capsule_number,
				capsule_name: item.pcapsule_name,
				theme: item.PT,
			});
		}
	});

	return { capsules: userCapsules, capsule_cnt: userCapsules.length };
};

export const getCapsuleByType = async (c_num) => {
	const capsuleType = await getCapsuleType(c_num);

	if (capsuleType == -1) throw new BaseError(status.CAPSULE_NOT_FOUND);

	return capsuleType;
};

// 캡슐 상태변경
export const updateOpenDate_p = async () => {
	const connection = await pool.getConnection(async (conn) => conn);

	try {
		connection.beginTransaction();

		await updateOpenDate_d(connection);

		await connection.commit();

		return { message: "updateCapsule saved successfully." };
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

// (status ACTIVE 시) 알림메일 발송
// client에서 따로 http 요청을 보낼 필요가 없으므로 controller 대신 provider에서 구현함..
export const sendNotificationEmail = async () => {
	try {
		const oneDayAgo = new Date();
		oneDayAgo.setDate(oneDayAgo.getDate() - 1);

		const connection = await pool.getConnection(async (conn) => conn);

		const updatedRows = await checkUpdatedRows(connection, oneDayAgo);

		for (const row of updatedRows) {
			const userEmail = await getUserEmail(connection, row.capsule_number);

			// 메일 보내기
			await transporter
				.sendMail({
					from: `"Re-Memory" <${process.env.NODEMAILER_USER}>`,
					to: `${userEmail}`,
					subject: "작성하신 타임캡슐이 열렸어요! 💌",
					text: `
          타임캡슐 ${row.capsule_name}이 열렸습니다.
                  지금 리메모리 페이지에 방문하여 캡슐을 확인해 보세요 ✨
                  저희 'Re-Memory'의 서비스를 이용해주셔서 감사합니다.

                  타임캡슐을 확인할 수 있는 캡슐 고유번호, 비밀번호를 메일 하단에 첨부하였습니다.
                  
                  ✔ 캡슐 번호: ${row.capsule_number},
                  ✔ 캡슐 비밀번호: ${row.capsule_password}
          
          저희 서비스를 이용해 주셔서 감사합니다.
          `,
				})
				.then((r) => console.log("저장 및 발송 성공", r))
				.catch((e) => console.log("에러", e));
		}
	} catch (error) {
		console.error(error);
	}
};


// (status ACTIVE 시) 알림메일 발송
// client에서 따로 http 요청을 보낼 필요가 없으므로 controller 대신 provider에서 구현함..
export const sendDeleteEmail = async () => {
	try {
	   const oneDayAgo = new Date();
	   oneDayAgo.setDate(oneDayAgo.getDate() - 1);
 
	   const connection = await pool.getConnection(async (conn) => conn);
 
	   const updatedRows = await checkUpdatedRows(connection, oneDayAgo);
 
	   for (const row of updatedRows) {
		  const userEmail = await getUserEmail(connection, row.capsule_number);
 
		  // 메일 보내기
		  await transporter
			 .sendMail({
				from: `"Re-Memory" <${process.env.NODEMAILER_USER}>`,
				to: `${userEmail}`,
				subject: "타임캡슐이 삭제되었습니다:) 💌",
				text: `
		   타임캡슐이 삭제되었습니다.
		   저희 서비스를 이용해 주셔서 감사합니다.
		   `,
			 })
			 .then((r) => console.log("저장 및 발송 성공", r))
			 .catch((e) => console.log("에러", e));
	   }
	} catch (error) {
	   console.error(error);
	}
 };