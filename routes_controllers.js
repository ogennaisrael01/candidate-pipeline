import { logger } from "./logger.js";
import { applicationRouter } from "./src/routes/applications.js" 
import path from "path";
import express from "express"


export const packageRoutes = app => {
    app.use("/api", applicationRouter)
    app.use("/uploads", express.static(path.resolve("uploads")))
}