import express from "express";
import asyncHandler from "express-async-handler";
import { healthController, healthDBController } from "./healthController.js";

export const healthRoute = express.Router();

healthRoute.get("", healthController);
healthRoute.get("/db", asyncHandler(healthDBController));
