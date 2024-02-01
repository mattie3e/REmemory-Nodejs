import express from "express";
import asyncHandler from "express-async-handler";

import {
	readNumNUrl_c,
	readDear_c,
	createText_c,
} from "./rcapsuleController.js";

export const rcapsuleRouter = express.Router();

//캡슐번호, 롤링페이퍼 url 받기
rcapsuleRouter.get("/rcapsule/info", asyncHandler(readNumNUrl_c));

//url 들어왔을 시
rcapsuleRouter.get("/rcapsule_number", asyncHandler(readDear_c));

//글&사진 쓰기
rcapsuleRouter.post("/rcapsule_number/text_photo", asyncHandler(createText_c));
