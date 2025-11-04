import { defineConfig, env } from "prisma/config";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, "./.env")});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in .env file");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
