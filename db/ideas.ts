import { and, desc, eq, like, lt } from "drizzle-orm"
import { getDb } from "@/db/client"
import { ideas, type Idea, type NewIdea } from "@/db/schema"

export type IdeaUpdate = Partial<
  Pick<Idea, "content" | "status" | "tags" | "pinned" | "background_color" | "deleted_at">
>

export type IdeaUpsert = {
  content: string
} & Partial<
  Pick<
    Idea,
    | "source"
    | "status"
    | "tags"
    | "pinned"
    | "background_color"
    | "deleted_at"
    | "created_at"
    | "updated_at"
  >
>

export async function findIdeas({
  userId,
  status,
  search,
  pinned,
  cursor,
  limit = 50,
}: {
  userId: string
  status: NonNullable<Idea["status"]>
  search?: string | null
  pinned?: boolean
  cursor?: string | null
  limit?: number
}) {
  const db = getDb()
  const filters = [
    eq(ideas.user_id, userId),
    eq(ideas.status, status),
  ]

  if (pinned) {
    filters.push(eq(ideas.pinned, 1))
  }

  if (cursor) {
    filters.push(lt(ideas.created_at, cursor))
  }

  if (search) {
    filters.push(like(ideas.content, `%${search}%`))
  }

  return db
    .select()
    .from(ideas)
    .where(and(...filters))
    .orderBy(desc(ideas.created_at), desc(ideas.id))
    .limit(limit + 1)
}

export async function findPinnedIdeas({
  userId,
}: {
  userId: string
}) {
  const db = getDb()
  return db
    .select()
    .from(ideas)
    .where(and(
      eq(ideas.user_id, userId),
      eq(ideas.pinned, 1),
      eq(ideas.status, "inbox"),
    ))
    .orderBy(desc(ideas.created_at))
}

export async function findIdeaById({
  id,
  userId,
}: {
  id: string
  userId: string
}) {
  const db = getDb()
  const [idea] = await db
    .select()
    .from(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.user_id, userId)))
    .limit(1)

  return idea ?? null
}

export async function createIdea(values: Omit<NewIdea, "id"> & { id?: string }) {
  const db = getDb()
  const id = values.id ?? crypto.randomUUID()
  const now = new Date().toISOString()
  const [idea] = await db.insert(ideas).values({
    ...values,
    id,
    created_at: values.created_at ?? now,
    updated_at: values.updated_at ?? now,
  }).returning()
  return idea
}

export async function upsertIdea({
  id,
  userId,
  values,
}: {
  id: string
  userId: string
  values: IdeaUpsert
}) {
  const db = getDb()
  const [idea] = await db
    .insert(ideas)
    .values({ id, user_id: userId, ...values })
    .onConflictDoUpdate({
      target: ideas.id,
      set: values,
      setWhere: and(eq(ideas.user_id, userId)),
    })
    .returning()

  return idea ?? null
}

export async function updateIdea({
  id,
  userId,
  values,
}: {
  id: string
  userId: string
  values: IdeaUpdate
}) {
  const db = getDb()
  const [idea] = await db
    .update(ideas)
    .set({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(ideas.id, id), eq(ideas.user_id, userId)))
    .returning()

  return idea ?? null
}

export async function deleteIdea({ id, userId }: { id: string; userId: string }) {
  const db = getDb()
  const [idea] = await db
    .delete(ideas)
    .where(and(eq(ideas.id, id), eq(ideas.user_id, userId)))
    .returning({ id: ideas.id })

  return idea ?? null
}
