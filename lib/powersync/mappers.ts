import type { Idea, IdeaSource, IdeaStatus } from "@/types/idea"
import type { IdeaRow } from "@/lib/powersync/schema"

export function ideaRowToIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    content: row.content ?? "",
    source: (row.source as IdeaSource | null) ?? "web",
    status: (row.status as IdeaStatus | null) ?? "inbox",
    tags: parseTags(row.tags),
    pinned: row.pinned === 1,
    background_color: row.background_color ?? null,
    deleted_at: row.deleted_at ?? null,
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
  }
}

function parseTags(tags: string | null): string[] | null {
  if (!tags) return null
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? (parsed.filter((t): t is string => typeof t === "string") as string[]) : null
  } catch {
    return null
  }
}
