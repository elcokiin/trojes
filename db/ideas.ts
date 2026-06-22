import { and, desc, eq, ilike } from "drizzle-orm"
import { getDb } from "@/db/client"
import { ideas, type Idea, type NewIdea } from "@/db/schema"

export async function findIdeas({
  userId,
  status,
  search,
  pinned,
}: {
  userId: string
  status: NonNullable<Idea["status"]>
  search?: string | null
  pinned?: boolean
}) {
  const db = getDb()
  const filters = [
    eq(ideas.user_id, userId),
    eq(ideas.status, status),
  ]

  if (pinned) {
    filters.push(eq(ideas.pinned, true))
  }

  if (search) {
    filters.push(ilike(ideas.content, `%${search}%`))
  }

  return db
    .select()
    .from(ideas)
    .where(and(...filters))
    .orderBy(desc(ideas.created_at))
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
      eq(ideas.pinned, true),
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

export async function createIdea(values: NewIdea) {
  const db = getDb()
  const [idea] = await db.insert(ideas).values(values).returning()
  return idea
}

export async function updateIdea({
  id,
  userId,
  values,
}: {
  id: string
  userId: string
  values: Partial<Pick<Idea, "content" | "status" | "tags" | "pinned" | "background_color" | "deleted_at">>
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
