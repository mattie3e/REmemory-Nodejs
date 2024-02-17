import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
// const AWS = require('./aws'); // aws.js 파일 가져오기
import AWS from "./aws";

// 코드 중복 방지
const s3Client = new AWS.S3();

const upload = multer({
	storage: multerS3({
		s3: s3Client,
		bucket: process.env.S3_BUCKET_NAME,
		acl: "public-read-write",
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key(req, file, cb) {
			cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
			// console.log(req.body);
		},
	}),
	//    limits: { fileSize: 5 * 1024 * 1024 }, 5mb 용량 제한 (이건 나중에 필요할듯)
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

const imageupload = multer({
	storage: multerS3({
		s3: s3Client,
		bucket: process.env.S3_BUCKET_NAME,
		acl: "public-read-write",
		key(req, file, callback) {
			const extension = path.extname(file.originalname);
			//extension확인을 위한 코드
			if (!allowedExtensions.includes(extension)) {
				return callback(new Error("wrong extension"));
			}
			cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
		},
	}),
});

export const uploadImageToS3 = async (base64Image) => {
	// 이미지 타입 추출 (예: 'image/png')
	const imageType = base64Image.match(/data:(.*);base64,/)[1];

	// base64 인코딩 부분만 추출
	// base64 데이터의 헤더 부분을 제거한 후 Buffer.from 함수에 전달
	const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

	const buffer = Buffer.from(base64Data, "base64");

	// 확장자 추출 (예: 'png')
	const extension = imageType.split("/")[1];

	const fileName = `images/${Date.now().toString()}.${extension}`; // 파일명 설정

	const data = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: fileName,
		Body: buffer,
		ContentEncoding: "base64",
		ContentType: imageType,
		ACL: "public-read",
	};

	try {
		const response = await s3Client.upload(data).promise();
		// console.log("esponse.Location: ", response.Location);
		return response.Location; // 업로드된 이미지의 URL을 반환
	} catch (error) {
		console.log("uploadImageToS3 err : ", error);
	}
};

// export default imageupload;
export default upload;
