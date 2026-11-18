import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { config } from "dotenv";

config();

// Same DATABASE_URL the Prisma CLI uses, so app and migrations always hit the same database.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

const prisma = new PrismaClient({ adapter });
export default prisma;
