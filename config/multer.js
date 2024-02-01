// import multer from "multer";
// import multerS3 from "multer-s3";
// import path from "path";
// // const AWS = require('./aws'); // aws.js 파일 가져오기
// import AWS from "./aws";

// const upload = multer({
// 	storage: multerS3({
// 		s3: new AWS.S3(),
// 		bucket: process.env.S3_BUCKET_NAME,
// 		acl: "public-read",
// 		contentType: multerS3.AUTO_CONTENT_TYPE,
// 		key(req, file, cb) {
// 			cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
// 		},
// 	}),
// 	//    limits: { fileSize: 5 * 1024 * 1024 }, 5mb 용량 제한 (이건 나중에 필요할듯)
// });

// const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

// const imageupload = multer({
// 	storage: multerS3({
// 		s3: new AWS.S3(),
// 		bucket: process.env.S3_BUCKET_NAME,
// 		acl: "public-read-write",
// 		key(req, file, callback) {
// 			const extension = path.extname(file.originalname);
// 			//extension확인을 위한 코드
// 			if (!allowedExtensions.includes(extension)) {
// 				return callback(new Error("wrong extension"));
// 			}
// 			cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
// 		},
// 	}),
// });

// export default imageupload;
