import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { logger } from "../../logger.js";


const worker = new Worker("emailQueue", async job => {
    // simulate sending email. 
    logger.info(`Processing Job: ${job.name}. Sending email to ${job.data.email}`)
    await new Promise(res => setTimeout(res, 5000));
    logger.info(`Job finished. Email sent to ${job.data.email}`)
}, { 
    connection: redis,
    concurrency:3
})
