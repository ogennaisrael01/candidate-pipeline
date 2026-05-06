import "dotenv/config";
import Redis from "ioredis";
import { logger } from "../../logger.js";

export const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    { maxRetriesPerRequest: null}
)

redis.on("connect", () => {
    logger.info("Redis connected successfully")
})

redis.on("error", (err) => {
    logger.error(`Failed redis connection. Reason: ${err}`)
})