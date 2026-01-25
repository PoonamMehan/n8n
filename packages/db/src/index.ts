import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
console.log('connectionStrring:', connectionString)
if (!connectionString) {
  console.log("can't find the db string")
}
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export * from "./generated/prisma/client.js";