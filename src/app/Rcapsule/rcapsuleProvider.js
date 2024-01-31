import { pool } from "../../../config/dbConfig.js";
import { BaseError } from "../../../config/error.js";
import transporter from "../../../config/nodemailer.js";
import { status } from "../../../config/responseStatus.js";

import { checkCapsuleNum_d, updateOpenedStatus_d, checkUpdatedRows, getUserEmail } from "./rcapsuleDao.js";

export const createCapsuleNum_r = async (nickname) => {
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

// 캡슐 상태변경
export const updateOpenedStatus_r = async () => {
	await updateOpenedStatus_d();
};

export const sendNotificationEmail = async () => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const connection = await pool.getConnection(async (conn) => conn);

        const updatedRows = await checkUpdatedRows(connection, oneDayAgo);

        for (const row of updatedRows) {
            const userEmail = await getUserEmail(connection, row.capsule_number);

            // 메일 보내기
            const info = await transporter.sendMail({
                from: `"Re-Memory" <${process.env.REMEMORY_EMAIL}>`,
                to: `${userEmail}`,
                subject: "작성하신 타임캡슐이 열렸어요! 💌",
                text: `타임캡슐 ${row.rcapsule_name}이 열렸습니다.
                    지금 리메모리 페이지에 방문하여 캡슐을 확인해 보세요 ✨
                    저희 'Re-Memory'의 서비스를 이용해주셔서 감사합니다.

                    타임캡슐을 확인할 수 있는 캡슐 고유번호, 비밀번호를 메일 하단에 첨부하였습니다.
                    
                    ✔ 캡슐 번호: ${row.capsule_number},
                    ✔ 캡슐 비밀번호: ${row.rcapsule_password}`
            }, (err, info) => {
                if (err) {
                    console.error(`Failed to send email to ${userEmail}:`, error);
                } else {
                    console.log(`Email sent to ${userEmail}. Message ID: ${info.messageId}`);
                }
            });

            console.log('이메일 전송 성공 : ', userEmail);
        }
    } catch (error) {
        console.error(error);
    }
};

// export const sendNotificationEmail = async () => {
//     const oneDayAgo = new Date();
//     oneDayAgo.setDate(oneDayAgo.getDate() - 1);

//     const connection = await pool.getConnection(async (conn) => conn);

//     const updatedRows = await checkUpdatedRows(connection, oneDayAgo);
//     /*[
//     { capsule_number: 1, rcapsule_name: 'Example Capsule 1', rcapsule_password: 'password1' },
//     { capsule_number: 2, rcapsule_name: 'Example Capsule 2', rcapsule_password: 'password2' },
//     // 추가적인 행들...]*/
//     updatedRows.forEach(async (row) => {
//         const userEmail = await getUserEmail(connection, row.capsule_number);

//         //메일 보내기
//         const info = await transporter.sendMail({
//             from: `"Re-Memory" <${process.env.REMEMORY_EMAIL}>`,
//             to: `${userEmail}`,
//             subject: "작성하신 타임캡슐이 열렸어요! 💌",
//             text: `타임캡슐 ${row.rcapsule_name}이 열렸습니다.
//             지금 리메모리 페이지에 방문하여 캡슐을 확인해 보세요 ✨
//             저희 'Re-Memory의 서비스를 이용해주셔서 감사합니다.

//             타임캡슐을 확인할 수 있는 캡슐 고유번호, 비밀번호를 메일 하단에 첨부하였습니다.
            
//             ✔ 캡슐 번호 : ${row.capsule_number},
//             ✔ 캡슐 비밀번호 : ${row.rcapsule_password}`
//         });
//         console.log(info);
//     });

// };

/*sendMail(mailOptions: Mail.Options, callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void): void*/