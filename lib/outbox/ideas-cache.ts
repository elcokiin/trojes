import { Effect } from "effect"
import { db, type CachedIdea } from "./db"
import { IdeasCacheError } from "@/lib/errors"
import type { IdeasCacheMessage } from "@/stores/ideas-store"
import type { Idea } from "@/types/idea"

/**
 * IndexedDB mirror of every idea the client knows about — server rows that have
 * been fetched, plus local rows still waiting in the outbox. This is what the
 * zustand store hydrates from, so a reload renders the last known list before
 * any network round trip.
 *
 * The store never calls these functions: it queues `IdeasCacheMessage`s and the
 * controller (./ideas-cache-controller.ts) applies them here.
 */

export function toCachedIdea(
  idea: Idea,
  userId: string,
  isLocal: boolean,
): CachedIdea {
  return {
    id: idea.id,
    content: idea.content,
    source: idea.source,
    status: idea.status,
    tags: idea.tags ? JSON.stringify(idea.tags) : null,
    pinned: idea.pinned,
    background_color: idea.background_color,
    created_at: idea.created_at,
    updated_at: idea.updated_at,
    deleted_at: idea.deleted_at,
    userId,
    isLocal,
  }
}

export function toIdea(row: CachedIdea): Idea {
  return {
    id: row.id,
    content: row.content,
    source: row.source as Idea["source"],
    status: row.status as Idea["status"],
    tags: parseTags(row.tags),
    pinned: row.pinned,
    background_color: row.background_color,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  }
}

function parseTags(tags: string | null): string[] | null {
  if (!tags) return null
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? (parsed as string[]) : null
  } catch {
    return null
  }
}

export async function readCachedIdeas(userId: string): Promise<CachedIdea[]> {
  return db.ideas.where("userId").equals(userId).toArray()
}

export async function applyCacheMessages(
  messages: IdeasCacheMessage[],
): Promise<void> {
  if (messages.length === 0) return

  // Message order is load-bearing (replace deletes then puts), so these writes
  // are deliberately sequential rather than parallelised.
  // oxlint-disable no-await-in-loop
  await db.transaction("rw", [db.ideas], async () => {
    for (const message of messages) {
      switch (message.type) {
        case "upsert": {
          const rows = message.ideas.map((idea) =>
            toCachedIdea(idea, message.userId, message.local ?? false),
          )
          await db.ideas.bulkPut(rows)
          break
        }
        case "replace": {
          await db.ideas.delete(message.localId)
          await db.ideas.put(toCachedIdea(message.idea, message.userId, false))
          break
        }
        case "remove": {
          await db.ideas.delete(message.ideaId)
          break
        }
        case "clear": {
          await db.ideas.where("userId").equals(message.userId).delete()
          break
        }
      }
    }
  })
  // oxlint-enable no-await-in-loop
}

export async function clearCachedIdeas(userId: string): Promise<void> {
  await db.ideas.where("userId").equals(userId).delete()
}

function wrapCache<A>(
  operation: string,
  fn: () => Promise<A>,
): Effect.Effect<A, IdeasCacheError> {
  return Effect.tryPromise({
    try: fn,
    catch: (cause) => new IdeasCacheError({ cause, operation }),
  })
}

export const ReadCachedIdeas = {
  execute: (userId: string) =>
    wrapCache("readCachedIdeas", () => readCachedIdeas(userId)),
}

export const ApplyCacheMessages = {
  execute: (messages: IdeasCacheMessage[]) =>
    wrapCache("applyCacheMessages", () => applyCacheMessages(messages)),
}

export const ClearCachedIdeas = {
  execute: (userId: string) =>
    wrapCache("clearCachedIdeas", () => clearCachedIdeas(userId)),
}