import { Router } from "express";
import { applyToJobs } from "../contollers/applications.js";
import { upload } from "../middlewares/upload_files.js";

export const applicationRouter = Router();

applicationRouter.post("/applications", upload.single("resume"), applyToJobs)
