import { QueueEvents } from "bullmq";
import { redis } from "../lib/redis.js";
import { logger } from "../../logger.js";

export const emailEvents = new QueueEvents("emailQueue", { connection: redis})

emailEvents.on("completed", ({ jobId }) => {
    logger.info(` Job with ID: ${jobId}, completed successfully`)
})

emailEvents.on("failed", async ({ jobId, failedReason }) => {
    logger.info(`Failed Job: ${jobId}. Reason: ${failedReason}`)
})

emailEvents.on("retrying", async ( { jobId, err} ) => {
    logger.info(`Job with ID: ${jobId} Retrying. Reason: ${err}`)
})
