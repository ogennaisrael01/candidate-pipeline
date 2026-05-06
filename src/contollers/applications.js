
import { ApplicationSchema } from "../validators/application_validator.js";
import { logger } from "../../logger.js"


export const applyToJobs = async (req, res) => {
    console.log("file", req.file)
    console.log("Body", req.body)
    const request_data = req.body;

    const isValidObject = await ApplicationSchema.safeParse(request_data);
    if (!isValidObject.success){
        return res.status(400).json(isValidObject.error)
    }

    const { email, firstName, lastName, location, phone } = isValidObject.data

    if (!req.file){
        return res.status(400).json({status: false, details: "resume cannot be empty"})
    }

    const fileName = req.file.fileName

    // build resume url here (S3 style)
    const resume_url = `${process.env.BASE_URL}/uploads/${fileName}`
    console.log(resume_url)
}