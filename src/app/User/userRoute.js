import express from "express";
import {
	KakaoGetUserInfo,
	userGetInfo,
	userSetNickname,
} from "./UserController.js";
import { tokenAuthMiddleware } from "../../../config/tokenAuthMiddleware.js";

export const userRouter = express.Router();

// 회원가입, 로그인
userRouter.get("/auth", KakaoGetUserInfo);

// 신규회원 닉네임 초기 설정
userRouter.patch("/", userSetNickname);

// 회원정보 불러오기
userRouter.get("/", tokenAuthMiddleware, userGetInfo);

// 기존회원 닉네임 변경
userRouter.patch("/nickname", tokenAuthMiddleware, userSetNickname);
