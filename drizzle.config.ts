import { config } from "dotenv"
import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

// Next.js loads .env.local automatically for the app, but drizzle-kit only
// read .env when importing "dotenv/config". Load .env first, then let
// .env.local (which holds secrets in this repo) take precedence so
// `bun run db:migrate` uses the same DATABASE_URL as the running app.
config()
if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true })
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL")
}

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
