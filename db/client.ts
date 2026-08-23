import { defineRelations } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

type Database = ReturnType<typeof createDatabase>

let database: Database | null = null

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  return drizzle(databaseUrl, { relations: defineRelations(schema) })
}

export function getDb() {
  database ??= createDatabase()
  return database
}
