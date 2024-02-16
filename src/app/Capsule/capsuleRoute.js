import express from "express";
import asyncHandler from "express-async-handler";
import { tokenAuthMiddleware } from "../../../config/tokenAuthMiddleware";

export const capsuleRouter = express.Router();

// 캡슐번호 조회 - p캡슐인지 r캡슐인지 구분할 수 있도록
capsuleRouter.get("/retrieve", asyncHandler(readcs_c));

// 유저의 전체 캡슐 가져오기
capsuleRouter.get(
	"retrieve/all",
	tokenAuthMiddleware,
	asyncHandler(getCapsules),
);
