import * as Effect from "effect/Effect"
import { and, desc, eq } from "drizzle-orm"
import { getDb } from "@/db/client"
import { apiKeys } from "@/db/schema"
import { DatabaseError } from "@/lib/errors"

export const findApiKeysByUserId = (userId: string) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      return db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          key_preview: apiKeys.key_preview,
          created_at: apiKeys.created_at,
          last_used_at: apiKeys.last_used_at,
        })
        .from(apiKeys)
        .where(eq(apiKeys.user_id, userId))
        .orderBy(desc(apiKeys.created_at))
    },
    catch: (cause) => new DatabaseError({ cause, query: "findApiKeysByUserId" }),
  })

export const createApiKey = (values: {
  user_id: string
  name: string
  key_hash: string
  key_preview: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const id = crypto.randomUUID()
      const [key] = await db
        .insert(apiKeys)
        .values({ ...values, id })
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          key_preview: apiKeys.key_preview,
          created_at: apiKeys.created_at,
          last_used_at: apiKeys.last_used_at,
        })
      return key
    },
    catch: (cause) => new DatabaseError({ cause, query: "createApiKey" }),
  })

export const findUserIdByApiKeyHash = (keyHash: string) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [key] = await db
        .select({ user_id: apiKeys.user_id })
        .from(apiKeys)
        .where(eq(apiKeys.key_hash, keyHash))
        .limit(1)
      return key?.user_id ?? null
    },
    catch: (cause) => new DatabaseError({ cause, query: "findUserIdByApiKeyHash" }),
  })

export const markApiKeyUsed = (keyHash: string) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      await db
        .update(apiKeys)
        .set({ last_used_at: new Date().toISOString() })
        .where(eq(apiKeys.key_hash, keyHash))
    },
    catch: (cause) => new DatabaseError({ cause, query: "markApiKeyUsed" }),
  })

export const updateApiKeyName = ({
  id,
  userId,
  name,
}: {
  id: string
  userId: string
  name: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [key] = await db
        .update(apiKeys)
        .set({ name })
        .where(and(eq(apiKeys.id, id), eq(apiKeys.user_id, userId)))
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          key_preview: apiKeys.key_preview,
          created_at: apiKeys.created_at,
          last_used_at: apiKeys.last_used_at,
        })
      return key ?? null
    },
    catch: (cause) => new DatabaseError({ cause, query: "updateApiKeyName" }),
  })

export const deleteApiKey = ({
  id,
  userId,
}: {
  id: string
  userId: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [key] = await db
        .delete(apiKeys)
        .where(and(eq(apiKeys.id, id), eq(apiKeys.user_id, userId)))
        .returning({ id: apiKeys.id })
      return key ?? null
    },
    catch: (cause) => new DatabaseError({ cause, query: "deleteApiKey" }),
  })
