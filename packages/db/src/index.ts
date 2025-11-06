import {PrismaClient, Prisma} from "@prisma/client";

export * from "@prisma/client";

const prisma = new PrismaClient();

export { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
export default prisma;