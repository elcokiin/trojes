import { and, eq } from "drizzle-orm"
import { getDb } from "@/db/client"
import { accounts, users } from "@/db/schema"

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const db = getDb()
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user?.id ?? null
}

export async function createUser(values: {
  name?: string | null
  email: string
  image?: string | null
}) {
  const db = getDb()
  const [user] = await db
    .insert(users)
    .values(values)
    .returning({ id: users.id })

  return user
}

export async function updateUserProfile({
  id,
  name,
  image,
}: {
  id: string
  name?: string | null
  image?: string | null
}) {
  const db = getDb()
  await db
    .update(users)
    .set({
      name,
      image,
      updated_at: new Date().toISOString(),
    })
    .where(eq(users.id, id))
}

export async function accountExists({
  provider,
  providerAccountId,
}: {
  provider: string
  providerAccountId: string
}) {
  const db = getDb()
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.provider, provider),
        eq(accounts.provider_account_id, providerAccountId)
      )
    )
    .limit(1)

  return Boolean(account)
}

export async function createAccount(values: typeof accounts.$inferInsert) {
  const db = getDb()
  await db.insert(accounts).values(values)
}
