import express from "express";
import compression from "compression"; // 응답 데이터 압축, 네트워크 비용 절감
import methodOverride from "method-override"; // HTTP 메소드 재정의 가능, 웹 브라우저에서 지원하지 않는 PUT이나 DELETE도 메소드 사용 가능하게 해줌
import cookieParser from "cookie-parser"; // HTTP 요청의 쿠키를 파싱하여 req.cookies 생성
import cors from "cors";

export default function () {
	const app = express();

	app.use(express.json({ limit: "5mb" })); // JSON 파싱 미들웨어에서 본문 크기 제한 설정
	// 클라이언트로부터 받은 JSON 데이터를 파싱하여 req.body 객체를 생성
	app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱 미들웨어를 사용하도록 설정
	// 클라이언트로부터 받은 URL-encoded 데이터를 파싱하여 req.body 객체를 생성

	// compression 미들웨어 사용하도록 설정
	app.use(
		compression({
			level: 6,
			threshold: 100 * 1000, // 100kb 아래의 데이터는 압축 X
			filter: (req, res) => {
				if (req.headers["x-no-compression"]) {
					// header에 x-no-compression이 있으면, 압축하지 않도록 false를 반환
					return false;
				}
				return compression.filter(req, res);
				// 없는 경우에는 압축허용
			},
		}),
	);

	app.use(methodOverride()); // methodOverride 미들웨어를 사용하도록 설정
	app.use(cookieParser()); // cookieParser 미들웨어를 사용하도록 설정

	const whitelist = ["https://hatch.loca.lt"];
	const corsOption = {
		origin: function (origin, callback) {
			if (whitelist.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(null, true);
			}
		},
		credentials: true,
	};
	app.use(cors(corsOption));
	// CORS를 허용할 도메인의 목록(whitelist)을 정의하고, 이를 바탕으로 CORS 옵션을 설정
	// cors 미들웨어를 사용하도록 설정합니다.
	// 설정한 옵션에 따라, 특정 도메인에서의 요청만을 허용하거나 모든 도메인에서의 요청을 허용

	return app;
}
