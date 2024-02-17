import expressConfig from "./config/expressConfig.js";
import { startSchedulers } from "./config/scheduler.js";
import { status } from "./config/responseStatus.js";
import { BaseError } from "./config/error.js";
import { response } from "./config/response.js";

import { specs } from "./config/swaggerConfig.js";
import SwaggerUi from "swagger-ui-express";

import { userRouter } from "./src/app/User/userRoute.js";
import { pcapsuleRouter } from "./src/app/Pcapsule/pcapsuleRoute.js";
import { rcapsuleRouter } from "./src/app/Rcapsule/rcapsuleRoute.js";
import { healthRoute } from "./src/app/Health/healthRoute.js";
import { capsuleRouter } from "./src/app/Capsule/capsuleRoute.js";

const app = expressConfig();
const port = 3000;

// swagger
app.use("/api-docs", SwaggerUi.serve, SwaggerUi.setup(specs));

app.use("/health", healthRoute);

app.get("/", (req, res, next) => {
	res.send(response(status.SUCCESS, "루트 페이지!"));
});

app.use("/user", userRouter);
app.use("/capsule", capsuleRouter);
app.use("/pcapsule", pcapsuleRouter);
app.use("/rcapsule", rcapsuleRouter);

startSchedulers();

// error handling
// app.use((req, res, next) => {
// 	const err = new BaseError(status.NOT_FOUND);
// 	next(err);
// });

app.use((err, req, res, next) => {
	// 템플릿 엔진 변수 설정
	res.locals.message = err.message;
	// 개발환경이면 에러를 출력하고 아니면 출력하지 않기
	res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
	console.error(err);

	// 에러 데이터가 있는 경우에만 해당 데이터를 사용하여 응답을 보냄
	if (err.data) {
		// BaseError 인스턴스인지 확인, 그에 맞는 HTTP 상태 코드를 설정 후 응답
		if (err instanceof BaseError) {
			const { status, isSuccess, code, message } = err.data;
			res.status(status).send(response({ isSuccess, code, message }));
		} else {
			// BaseError가 아닌 다른 에러인 경우에는 기본적으로 500 상태 코드를 반환
			res.status(500).send(response(status.INTERNAL_SERVER_ERROR));
		}
	} else {
		// 에러 데이터가 없는 경우에는 기본적으로 500 상태 코드를 반환
		res.status(500).send(response(status.INTERNAL_SERVER_ERROR));
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
