import * as Effect from "effect/Effect"
import { and, eq } from "drizzle-orm"
import { getDb } from "@/db/client"
import { users, accounts } from "@/db/schema"
import { DatabaseError } from "@/lib/errors"

export const findUserIdByEmail = (email: string) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      return user?.id ?? null
    },
    catch: (cause) => new DatabaseError({ cause, query: "findUserIdByEmail" }),
  })

export const createUser = (values: {
  name?: string | null
  email: string
  image?: string | null
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const id = crypto.randomUUID()
      const [user] = await db
        .insert(users)
        .values({ ...values, id })
        .returning({ id: users.id })
      return user
    },
    catch: (cause) => new DatabaseError({ cause, query: "createUser" }),
  })

export const updateUserProfile = ({
  id,
  name,
  image,
}: {
  id: string
  name?: string | null
  image?: string | null
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      await db
        .update(users)
        .set({
          name,
          image,
          updated_at: new Date().toISOString(),
        })
        .where(eq(users.id, id))
    },
    catch: (cause) => new DatabaseError({ cause, query: "updateUserProfile" }),
  })

export const accountExists = ({
  provider,
  providerAccountId,
}: {
  provider: string
  providerAccountId: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [account] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.provider_account_id, providerAccountId),
          ),
        )
        .limit(1)
      return Boolean(account)
    },
    catch: (cause) => new DatabaseError({ cause, query: "accountExists" }),
  })

export const createAccount = (
  values: Omit<typeof accounts.$inferInsert, "id"> & { id?: string },
) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const id = values.id ?? crypto.randomUUID()
      await db.insert(accounts).values({ ...values, id })
    },
    catch: (cause) => new DatabaseError({ cause, query: "createAccount" }),
  })
