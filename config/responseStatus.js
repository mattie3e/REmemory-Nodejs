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

	INTERNAL_SERVER_ERROR: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		isSuccess: false,
		code: "COMMON000",
		message: "서버 에러, 관리자에게 문의 바랍니다.",
	},
	BAD_REQUEST: {
		status: StatusCodes.BAD_REQUEST,
		isSuccess: false,
		code: "COMMON001",
		message: "잘못된 요청입니다.",
	},
	NOT_FOUND: {
		status: StatusCodes.NOT_FOUND,
		isSuccess: false,
		code: "COMMON002",
		message: "찾을 수 없습니다.",
	},

	// capsule err
	CAPSULE_NOT_FOUND: {
		status: StatusCodes.NOT_FOUND,
		isSuccess: false,
		code: "CAPSULE4001",
		message: "존재하지 않는 캡슐입니다.",
	},

	CAPSULE_PASSWORD_WRONG: {
		status: StatusCodes.BAD_REQUEST,
		isSuccess: false,
		code: "CAPSULE4002",
		message: "패스워드가 잘못되었습니다.",
	},

	TEXT_IMAGE_NOT_FOUND: {
		status: StatusCodes.NOT_FOUND,
		isSuccess: false,
		code: "CAPSULE4003",
		message: "텍스트 및 이미지가 없습니다.",
	},

	VOICE_NOT_FOUND: {
		status: StatusCodes.NOT_FOUND,
		isSuccess: false,
		code: "CAPSULE4004",
		message: "음성이 없습니다.",
	},
};
