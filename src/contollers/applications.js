import { config } from "dotenv";
config();

import { ApplicationSchema } from "../validators/application_validator.js";
import { logger } from "../../logger.js"
import prisma from "../lib/prisma.js";
import { emailQueue } from "../queue/emailQueue.js";


export const applyToJobs = async (req, res) => {
    const request_data = req.body;

    const isValidObject = await ApplicationSchema.safeParse(request_data);
    if (!isValidObject.success){
        return res.status(400).json(isValidObject.error)
    }

    const { email, firstName, lastName, location, phone } = isValidObject.data

    if (!req.file){
        return res.status(400).json({status: false, details: "resume cannot be empty"})
    }

    const fileName = req.file.filename

    // build resume url here (S3 style)
    const resume_url = `${process.env.BASE_URL}/uploads/${fileName}`.trim()
    const newApplication = await prisma.application.create({
        data: {
            email, firstName, lastName, location, phone, resume_url
        }
    })

    try{
        // add job to queue
        if ( newApplication){
            
            await emailQueue.add("sendEmail", { email: email, name: `${firstName} ${lastName}`})
        }
    }
    catch (err){
        logger.error(err.message)
    }
    logger.info(`New application instance created: ${newApplication.id ?? null}`)

    return res.status(201).json({status: true, details:  newApplication})
}