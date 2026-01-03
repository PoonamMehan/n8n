import "dotenv/config";
import {PrismaClient} from "../prisma/generated/prisma/client.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

export default prisma;
export * from "../prisma/generated/prisma/client.js";
export {PrismaClientKnownRequestError};