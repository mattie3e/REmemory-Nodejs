import { StatusCodes } from "http-status-codes";

export const status = {
	SUCCESS: {
		status: StatusCodes.OK,
		isSuccess: true,
		code: 2000,
		message: "success!",
	},
	LOGIN_SUCCESS: {
		status: StatusCodes.OK,
		isSuccess: true,
		code: "USER001",
		message: "로그인에 성공했습니다.",
	},
	NICKNAME_REQUIRED: {
		status: StatusCodes.OK,
		isSuccess: true,
		code: "USER002",
		message: "회원가입에 성공했습니다. 닉네임을 설정해주세요.",
	},

	// error
	EMPTY_TOKEN: {
		status: StatusCodes.UNAUTHORIZED,
		isSuccess: false,
		code: "USER003",
		message: "사용자 인증에 실패했습니다.",
	},
	FORBIDDEN: {
		status: StatusCodes.FORBIDDEN,
		isSuccess: false,
		code: "USER004",
		message: "권한이 거부되었습니다.",
	},
	CURRENT_STATUS: {
		status: StatusCodes.BAD_REQUEST,
		isSuccess: false,
		code: "USER006",
		message: "계정 상태를 변경할 수 없습니다.",
	},

	BAD_REQUEST: {
		status: StatusCodes.BAD_REQUEST,
		isSuccess: false,
		code: "COMMON001",
		message: "잘못된 요청입니다.",
	},
};
