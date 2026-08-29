import { defineRelations } from "drizzle-orm"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "@/db/schema"

type Database = ReturnType<typeof createDatabase>

let database: Database | null = null

function createDatabase() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error("TURSO_DATABASE_URL environment variable is not set")
  }

  return drizzle({
    connection: { url, authToken },
    relations: defineRelations(schema),
  })
}

export function getDb() {
  database ??= createDatabase()
  return database
}
