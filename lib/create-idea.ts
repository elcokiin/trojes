import { resolveUserId } from "@/lib/offline-identity"
import { db } from "@/lib/powersync/db"
import type { Idea } from "@/types/idea"

export async function insertIdea(userId: string, content: string): Promise<Idea | null> {
  const trimmed = content.trim()
  if (!trimmed) return null

  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  try {
    await db.execute(
      "INSERT INTO ideas (id, user_id, content, source, status, tags, pinned, background_color, deleted_at, created_at, updated_at) VALUES (?, ?, ?, 'web', 'inbox', NULL, 0, NULL, ?, ?, ?)",
      [id, userId, trimmed, now, now],
    )
    return {
      id,
      content: trimmed,
      source: "web",
      status: "inbox",
      tags: null,
      pinned: false,
      background_color: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }
  } catch (error) {
    console.error("Failed to create idea:", error)
    return null
  }
}

export async function createIdea(content: string): Promise<{ ok: boolean; idea?: Idea }> {
  const userId = await resolveUserId()
  if (!userId) return { ok: false }

  const idea = await insertIdea(userId, content)
  if (!idea) return { ok: false }

  return { ok: true, idea }
}
