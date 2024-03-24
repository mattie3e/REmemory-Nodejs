// /*
// 카카오톡 알림톡 api 템플릿 - 비즈니스 계정 전환 후 재게
// 예시 딜러사 : solapi
// */

// //npm install --save solapi

// const {SolapiMessageService} = require('solapi');
// const messageService = new SolapiMessageService(
//     '{Enter API key}',
//     '{Enter API Secret}',
// );

// //단일 발송
// messageService
//     .sendOne({
//         to: phoneNumber, //수신번호
//         from: process.env.PHONE_NUMBER,
//         kakaoOptions: {
//             pfId: process.env.PF_ID,
//             templateId: process.env.TEMP_ID,
//             variables: {
//                 "#{title}": title,
//                 "#{day}": dayIndex,
//                 "#{url}": url,
//                 disableSms: true, //문자 대체발송 비활성화
//             }
//         },
//     })
//     .then(res => console.log(res));