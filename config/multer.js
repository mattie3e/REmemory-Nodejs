import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
// const AWS = require('./aws'); // aws.js 파일 가져오기
import AWS from './aws';

const upload = multer({
   storage: multerS3({
      s3: new AWS.S3(),
      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(req, file, cb) {
         cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
      },
   }),
//    limits: { fileSize: 5 * 1024 * 1024 }, 5mb 용량 제한 (이건 나중에 필요할듯)

});

export default upload;