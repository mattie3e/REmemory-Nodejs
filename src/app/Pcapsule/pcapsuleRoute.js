import express from "express";
import asyncHandler from "express-async-handler";

import {
	createPcs_c,
	savePassword_c,
	readPcs_c,
	readDetailPcs_c,
	updatePcs_c,
} from "./pcapsuleController.js";

export const pcapsuleRouter = express.Router();

pcapsuleRouter.post("/create", asyncHandler(createPcs_c));

pcapsuleRouter.post("/create/savePassword", asyncHandler(savePassword_c));

pcapsuleRouter.get("/retrieve", asyncHandler(readPcs_c));

pcapsuleRouter.get("/retrieveDetail", asyncHandler(readDetailPcs_c));

pcapsuleRouter.patch("/delete/:id", asyncHandler(updatePcs_c));
//삭제하기 전에 status를 비활성화시키기

