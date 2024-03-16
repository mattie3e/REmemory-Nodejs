import express from "express";
import asyncHandler from "express-async-handler";
import { tokenAuthMiddleware } from "../../../config/tokenAuthMiddleware.js";
import {
	getOwnCapsules,
	readCapsuleByType,
	readCapsuleDetail,
} from "./capsuleController.js";

export const capsuleRouter = express.Router();

// 캡슐번호 조회
capsuleRouter.get("/retrieve", asyncHandler(readCapsuleByType));

capsuleRouter.get("/retrieve/detail", asyncHandler(readCapsuleDetail));

capsuleRouter.post("/delete", asyncHandler(deleteStatusCapsule));

capsuleRouter.post("/delete/detail", asyncHandler(deleteCapsule));

// 유저의 전체 캡슐 가져오기
capsuleRouter.get(
	"/retrieve/all",
	tokenAuthMiddleware,
	asyncHandler(getOwnCapsules),
);
