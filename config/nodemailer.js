import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
//   pool: true,
//   service: "Naver",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export default transporter;