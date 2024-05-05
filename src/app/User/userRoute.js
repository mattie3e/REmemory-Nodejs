import express from "express";
import asyncHandler from "express-async-handler";
import {
	userGetInfo,
	userSetNickname,
	userSign,
	userStatusChange,
	userActivate,
} from "./userController.js";
import { tokenAuthMiddleware } from "../../../config/tokenAuthMiddleware.js";

export const userRouter = express.Router();

// 회원가입, 로그인
userRouter.get("/auth", asyncHandler(userSign));

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

// 추가 코드
// 비활성화 -> 활성화 변경
userRouter.patch("/activate", asyncHandler(userActivate));
