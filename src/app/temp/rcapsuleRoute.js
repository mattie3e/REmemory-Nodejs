import express from "express";
import asyncHandler from "express-async-handler";

import { 
    createRcapsule, 
    setRcapsulePw,
    addVoiceLetter_c,
 } from "./rcapsuleController.js";
import upload from "../../../config/multer.js";

export const rcapsuleRouter = express.Router();

rcapsuleRouter.post("/create", asyncHandler(createRcapsule));

rcapsuleRouter.patch("/:rcapsule_id", asyncHandler(setRcapsulePw));

rcapsuleRouter.post("/:rcapsule_number/voice", upload.single('voice_rcapsule'), asyncHandler(addVoiceLetter_c));