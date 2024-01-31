import AWS from "aws-sdk";
// import dotenv from "dotenv";
// dotenv.config();

//aws region 및 자격증명 설정
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  
    region: process.env.AWS_REGION,
});

export default AWS;
