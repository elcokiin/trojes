import { Effect } from "effect"
import { db, type OutboxItem, type CachedIdea } from "./db"
import { RepositoryError } from "@/lib/errors"
import type { Idea } from "@/types/idea"

/**
 * Records the intent to create an idea.
 *
 * Only the outbox row is written here. `db.ideas` is owned by the IndexedDB
 * controller, which writes it when the store emits the matching `upsert`
 * message. The outbox row is what makes the capture durable before that write
 * lands — and `outboxItemToIdea` can rebuild the card from it if the app dies
 * in between.
 */
export async function saveIdeaLocally(
  content: string,
  userId: string,
): Promise<Idea> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const idea: Idea = {
    id,
    content: content.trim(),
    source: "web",
    status: "inbox",
    tags: null,
    pinned: false,
    background_color: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  }

  const outboxItem: OutboxItem = {
    id,
    content: idea.content,
    status: "pending",
    userId,
    createdAt: now,
    retryCount: 0,
  }

  await db.outbox.put(outboxItem)

  return idea
}

/**
 * Rebuilds the render shape of a capture whose `db.ideas` row has not been
 * written yet (crash between the outbox write and the controller flush).
 */
export function outboxItemToIdea(item: OutboxItem): Idea {
  return {
    id: item.id,
    content: item.content,
    source: "web",
    status: "inbox",
    tags: null,
    pinned: false,
    background_color: null,
    created_at: item.createdAt,
    updated_at: item.createdAt,
    deleted_at: null,
  }
}

export async function getCachedIdeas(userId: string): Promise<CachedIdea[]> {
  return db.ideas.where("userId").equals(userId).reverse().sortBy("created_at")
}

export async function markSynced(id: string): Promise<void> {
  await db.transaction("rw", [db.ideas, db.outbox], async () => {
    await db.ideas.delete(id)
    await db.outbox.delete(id)
  })
}

export async function markFailed(id: string, error: string): Promise<void> {
  const item = await db.outbox.get(id)
  if (item) {
    await db.outbox.update(id, {
      status: "failed",
      lastError: error,
      retryCount: item.retryCount + 1,
    })
  }
}

export async function getPendingItems(): Promise<OutboxItem[]> {
  return db.outbox.where("status").equals("pending").toArray()
}

/**
 * Everything written locally that the server has not accepted yet. `failed`
 * items are included on purpose: they are retried on the next online event and
 * must keep rendering as pending until they succeed.
 */
export async function getUnsyncedItems(): Promise<OutboxItem[]> {
  return db.outbox.where("status").anyOf("pending", "failed").toArray()
}

export async function removeIdea(id: string): Promise<void> {
  await db.transaction("rw", [db.ideas, db.outbox], async () => {
    await db.ideas.delete(id)
    await db.outbox.delete(id)
  })
}

export async function getCachedIdea(id: string): Promise<CachedIdea | undefined> {
  return db.ideas.get(id)
}

function wrapRepository<A>(operation: string, fn: () => Promise<A>): Effect.Effect<A, RepositoryError> {
  return Effect.tryPromise({
    try: fn,
    catch: (cause) => new RepositoryError({ cause, operation }),
  })
}

export const SaveIdeaLocally = {
  execute: (content: string, userId: string) =>
    wrapRepository("saveIdeaLocally", () => saveIdeaLocally(content, userId)),
}

export const GetCachedIdeas = {
  execute: (userId: string) =>
    wrapRepository("getCachedIdeas", () => getCachedIdeas(userId)),
}

export const MarkSynced = {
  execute: (id: string) =>
    wrapRepository("markSynced", () => markSynced(id)),
}

export const MarkFailed = {
  execute: (id: string, error: string) =>
    wrapRepository("markFailed", () => markFailed(id, error)),
}

export const GetPendingItems = {
  execute: () =>
    wrapRepository("getPendingItems", () => getPendingItems()),
}

export const GetUnsyncedItems = {
  execute: () =>
    wrapRepository("getUnsyncedItems", () => getUnsyncedItems()),
}

export const RemoveIdea = {
  execute: (id: string) =>
    wrapRepository("removeIdea", () => removeIdea(id)),
}

export const GetCachedIdea = {
  execute: (id: string) =>
    wrapRepository("getCachedIdea", () => getCachedIdea(id)),
}
