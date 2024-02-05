import express from "express";
import asyncHandler from "express-async-handler";
// import upload from "../../../config/multer.js";

import {
	createRcapsule,
	setRcapsulePw,
	addVoiceLetter_c,
	readNumNUrl_c,
	readDear_c,
	createText_c,
} from "./rcapsuleController.js";
import upload from "../../../config/multer.js";

export const rcapsuleRouter = express.Router();

rcapsuleRouter.post("/create", asyncHandler(createRcapsule));

rcapsuleRouter.patch("/:rcapsule_id", asyncHandler(setRcapsulePw));

// rcapsuleRouter.post(
// 	"/:rcapsule_number/voice",
// 	upload.single("voice_rcapsule"),
// 	asyncHandler(addVoiceLetter_c),
// );

//캡슐번호, 롤링페이퍼 url 받기
rcapsuleRouter.get("/rcapsule/info", asyncHandler(readNumNUrl_c));

//url 들어왔을 시
rcapsuleRouter.get("/rcapsule_number", asyncHandler(readDear_c));

//글&사진 쓰기
rcapsuleRouter.post("/rcapsule_number/text_photo", asyncHandler(createText_c));
// rcapsuleRouter.post(
// 	"/:rcapsule_number/voice",
// 	upload.single("voice_rcapsule"),
// 	asyncHandler(addVoiceLetter_c),
// );
