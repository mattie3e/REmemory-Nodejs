import { BaseError } from "../../../config/error.js";
import { status } from "../../../config/responseStatus.js";

import { createPcs_d, createCapsuleNum_d } from "./pcapsuleDao.js";

export const createPcs_s = async (body, memeberId) => {
	const requiredFields = [
		"pcapsule_name",
		"open_date",
		"dear_name",
		"theme",
		"content_type",
		"content", // 글사진 or 음성 데이터
	];

	requiredFields.forEach((field) => {
		if (!body.hasOwnProperty(field)) {
			throw new Error(`Missing required field: ${field}`);
		}
	});

	// 사용자의 id로 DB에서 member 정보를 가져오는 함수
	// User/Member의 Dao에서 작성된 파일있으면 가져오면 됨
	const member = await getUserById(memeberId);
	// capsule_number 생성
	const capsule_number = createCapsuleNum_d(body.nickname);

	const { pcapsule_name, open_date, dear_name, theme, content_type, content } =
		body;

	// content_type에 따라 text_image 또는 voice 테이블에 데이터 저장
	// content는 보통 객체 또는 배열의 형태로 전달
	// 예시
	//   content: {
	//     body: "글 내용",
	//     image_url: "이미지 URL",
	//     sort: "정렬 여부"
	// },
	// content: "음성 URL"
	let text_image_id = null;
	let voice_id = null;

	if (content_type === "text_image") {
		const { body, image_url, sort } = content;
		text_image_id = await saveTextImage(body, image_url, sort);
	} else if (content_type === "voice") {
		voice_id = await saveVoice(content);
	}

	const createPcsData = await createPcs_d({
		pcapsule_name: pcapsule_name,
		open_date: open_date,
		dear_name: dear_name,
		theme: theme,
		content_type: content_type,
		text_image_id: text_image_id,
		voice_id: voice_id,
		capsule_number,
	});

	const NOT_EXIST = -1;

	if (createPcsData == NOT_EXIST) {
		throw new BaseError(status.CAPSULE_NOT_FOUND);
	} else {
		return { ...createPcsData, capsule_number };
	}

	// const result = await createPcs_d(body);
	// const NOT_EXIST = -1;
	// if (result == NOT_EXIST) {
	// 	throw new BaseError(status.CAPSULE_NOT_FOUND);
	// } else {
	// 	return result;
	// }
};
