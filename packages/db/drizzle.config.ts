import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "file:./local.db";
const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN;

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
    ...(databaseAuthToken ? { authToken: databaseAuthToken } : {}),
  },
  strict: true,
  verbose: true,
});
