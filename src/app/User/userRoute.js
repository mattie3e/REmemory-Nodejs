import express from "express";
import asyncHandler from "express-async-handler";
import {
	userGetInfo,
	userSetNickname,
	userSign,
	userStatusChange,
} from "./userController.js";
import { tokenAuthMiddleware } from "../../../config/tokenAuthMiddleware.js";

export const userRouter = express.Router();

// 회원가입, 로그인
userRouter.get("/auth", asyncHandler(userSign));

// 신규회원 닉네임 초기 설정
userRouter.patch("/", asyncHandler(userSetNickname));

// 회원정보 불러오기
userRouter.get("/:userId", tokenAuthMiddleware, asyncHandler(userGetInfo));

// 기존회원 닉네임 변경
userRouter.patch(
	"/nickname",
	tokenAuthMiddleware,
	asyncHandler(userSetNickname),
);

// 회원 비활성화
userRouter.patch(
	"/deactivate",
	tokenAuthMiddleware,
	asyncHandler(userStatusChange),
);
