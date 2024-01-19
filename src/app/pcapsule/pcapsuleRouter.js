import express from "express";
import asyncHandler from "express-async-handler";

import { createPcs_c, updatePcs_c, readPcs_c } from "./pcapsuleController.js";

export const pcapsuleRouter = express.Router();

pcapsuleRouter.post("/create", asyncHandler(createPcs_c));
// PATCH로 글+이미지 or 음성 받을때 update api 추가
// pcapsuleRouter.patch("/create/:id", asyncHandler(updatePcs_c));
// pcapsuleRouter.get("/retrieve", asyncHandler(readPcs_c));
