import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export const emailQueue = new Queue("emailQueue", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 500,
        backoff: {
            type: "exponential",
            delay: 5000
        }
    }
})