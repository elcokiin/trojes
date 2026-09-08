import * as Effect from "effect/Effect"
import { and, desc, eq, like, lt } from "drizzle-orm"
import { getDb } from "@/db/client"
import { ideas, type Idea, type NewIdea } from "@/db/schema"
import { DatabaseError } from "@/lib/errors"

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

export const findIdeas = ({
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
}) =>
  Effect.tryPromise({
    try: async () => {
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
    },
    catch: (cause) => new DatabaseError({ cause, query: "findIdeas" }),
  })

export const findPinnedIdeas = ({ userId }: { userId: string }) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      return db
        .select()
        .from(ideas)
        .where(
          and(
            eq(ideas.user_id, userId),
            eq(ideas.pinned, 1),
            eq(ideas.status, "inbox"),
          ),
        )
        .orderBy(desc(ideas.created_at))
    },
    catch: (cause) => new DatabaseError({ cause, query: "findPinnedIdeas" }),
  })

export const findIdeaById = ({
  id,
  userId,
}: {
  id: string
  userId: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [idea] = await db
        .select()
        .from(ideas)
        .where(and(eq(ideas.id, id), eq(ideas.user_id, userId)))
        .limit(1)
      return idea ?? null
    },
    catch: (cause) => new DatabaseError({ cause, query: "findIdeaById" }),
  })

export const createIdea = (values: Omit<NewIdea, "id"> & { id?: string }) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const id = values.id ?? crypto.randomUUID()
      const [idea] = await db.insert(ideas).values({ ...values, id }).returning()
      return idea
    },
    catch: (cause) => new DatabaseError({ cause, query: "createIdea" }),
  })

export const upsertIdea = ({
  id,
  userId,
  values,
}: {
  id: string
  userId: string
  values: IdeaUpsert
}) =>
  Effect.tryPromise({
    try: async () => {
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
    },
    catch: (cause) => new DatabaseError({ cause, query: "upsertIdea" }),
  })

export const updateIdea = ({
  id,
  userId,
  values,
}: {
  id: string
  userId: string
  values: IdeaUpdate
}) =>
  Effect.tryPromise({
    try: async () => {
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
    },
    catch: (cause) => new DatabaseError({ cause, query: "updateIdea" }),
  })

export const deleteIdea = ({
  id,
  userId,
}: {
  id: string
  userId: string
}) =>
  Effect.tryPromise({
    try: async () => {
      const db = getDb()
      const [idea] = await db
        .delete(ideas)
        .where(and(eq(ideas.id, id), eq(ideas.user_id, userId)))
        .returning({ id: ideas.id })
      return idea ?? null
    },
    catch: (cause) => new DatabaseError({ cause, query: "deleteIdea" }),
  })
