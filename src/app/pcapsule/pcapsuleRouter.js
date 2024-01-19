import express from "express";
import asyncHandler from "express-async-handler";

import { createPcs_c, updatePcs_c, readPcs_c } from "./pcapsuleController.js";

export const pcapsuleRouter = express.Router();

pcapsuleRouter.post("/create", asyncHandler(createPcs_c));
// pcapsuleRouter.get("/retrieve", asyncHandler(readPcs_c));
