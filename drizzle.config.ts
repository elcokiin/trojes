import { config } from "dotenv";
import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

config();
if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true });
}

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url,
  },
});
