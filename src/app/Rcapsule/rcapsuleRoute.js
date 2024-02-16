import express from "express";
import asyncHandler from "express-async-handler";
import upload from "../../../config/multer.js";

import {
	createRcapsule,
	setRcapsulePw,
	addVoiceLetter_c,
	readNumNUrl_c,
	readDear_c,
	createText_c,
	readRcs_c,
} from "./rcapsuleController.js";

export const rcapsuleRouter = express.Router();

rcapsuleRouter.post("/create", asyncHandler(createRcapsule));

rcapsuleRouter.patch("/:rcapsule_id", asyncHandler(setRcapsulePw));

rcapsuleRouter.post(
	"/voice/:rcapsule_number",
	upload.single("voice_rcapsule"),
	asyncHandler(addVoiceLetter_c),
);

//캡슐번호, 롤링페이퍼 url 받기
rcapsuleRouter.get("/rcapsule/info", asyncHandler(readNumNUrl_c));

//url 들어왔을 시
rcapsuleRouter.get("/rcapsule_number", asyncHandler(readDear_c));

//글&사진 쓰기
rcapsuleRouter.post(
	"/text_photo/:rcapsule_number",
	upload.single("photo_rcapsule"),
	asyncHandler(createText_c),
);

rcapsuleRouter.get("/retrieve", asyncHandler(readRcs_c));
