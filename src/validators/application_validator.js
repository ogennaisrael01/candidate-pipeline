import * as z from "zod";

export const ApplicationSchema = z.object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.email().trim().nonempty(),
    phone: z.string().nonempty(),
    location: z.string().nonempty(),
})