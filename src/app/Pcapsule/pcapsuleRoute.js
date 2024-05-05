import express from "express";
import asyncHandler from "express-async-handler";
import upload from "../../../config/multer.js";
import { uploadAudioToS3 } from "../../../config/multer.js";

import { tokenAuthMiddleware } from "../../../config/tokenAuthMiddleware.js";

import {
	createPcs_c,
	savePassword_c,
	readPcs_c,
	readDetailPcs_c,
	updatePcs_c,
	addTextImage_c,
	addVoice_c,
} from "./pcapsuleController.js";

export const pcapsuleRouter = express.Router();

pcapsuleRouter.post("/create", tokenAuthMiddleware, asyncHandler(createPcs_c));
// pcapsuleRouter.post("/create", asyncHandler(createPcs_c));

pcapsuleRouter.post("/create/text_image", asyncHandler(addTextImage_c));

// // 음성 저장 라우트
// pcapsuleRouter.post(
// 	"/create/voice",
// 	upload.single("voice_pcapsule"),
// 	asyncHandler(addVoice_c),
// );

// 음성 저장 라우트
pcapsuleRouter.post(
	"/create/voice",
	uploadAudioToS3.single("voice_pcapsule"),
	asyncHandler(addVoice_c),
);

pcapsuleRouter.post("/create/savePassword", asyncHandler(savePassword_c));

pcapsuleRouter.get("/retrieve", asyncHandler(readPcs_c));

pcapsuleRouter.get("/retrieveDetail", asyncHandler(readDetailPcs_c));

pcapsuleRouter.patch("/delete/:id", asyncHandler(updatePcs_c));
//삭제하기 전에 status를 비활성화시키기
