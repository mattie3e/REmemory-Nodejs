import express from "express";
import { healthController } from "./healthController.js";

export const healthRoute = express.Router();

healthRoute.get("", healthController);
