import { PrismaClient } from "@prisma/client/extension";

export const getPrismaClient = async () => {
    return new PrismaClient();
}