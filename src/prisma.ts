import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated";

const connectionString = process.env.DATABASE_URL;
const schemaName = process.env.SCHEMA_NAME;

// Create the adapter
const adapter = new PrismaPg({ connectionString }, { schema: schemaName });

// Create the Prisma client using the adapter
export const prisma = new PrismaClient({ adapter });
