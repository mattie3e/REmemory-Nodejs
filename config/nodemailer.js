import nodemailer from "nodemailer";

//ForwardEmail 서비스를 사용하고 있으며, ForwardEmail 계정을 만들어서 실제 값을 설정해야 정상적으로 동작합니다.

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        // user: 'rememory@gmail.com', //.env에 따로 저장 필요
        // pass: 'dd'
        user: process.env.REMEMORY_EMAIL,
        pass: process.env.MAIL_PASSWORD
    }
});

 export default transporter;