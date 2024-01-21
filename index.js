import expressConfig from "./config/expressConfig.js";

import { specs } from "./config/swagger.config.js";
import SwaggerUi from "swagger-ui-express";

import { userRouter } from "./src/app/User/userRoute.js";
import { pcapsuleRouter } from "./src/app/Pcapsule/pcapsuleRoute.js";
import { RcapsuleRouter } from "./src/app/Rcapsule/rcapsuleRoute.js";

const app = expressConfig();
const port = 3000;

// swagger
app.use("/api-docs", SwaggerUi.serve, SwaggerUi.setup(specs));

app.use("/user", userRouter);
app.use("/pcapsule", pcapsuleRouter);
app.use("/rcapsule", RcapsuleRouter);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
