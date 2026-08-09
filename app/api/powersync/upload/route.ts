import { getAuthenticatedUserId } from "@/lib/auth"
import { deleteIdea, updateIdea, upsertIdea } from "@/db/ideas"
import type { IdeaUpdate, IdeaUpsert } from "@/db/ideas"
import type { IdeaStatus, IdeaSource } from "@/types/idea"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_TABLES = new Set(["ideas"])
const VALID_STATUSES: IdeaStatus[] = ["inbox", "archived", "deleted"]
const VALID_SOURCES: IdeaSource[] = ["web", "telegram", "api"]

type UploadOp = {
  id: string
  op: "PUT" | "PATCH" | "DELETE"
  table: string
  opData?: Record<string, unknown>
}

function parseTags(tags: unknown): string[] | null {
  if (tags == null || tags === "") return null
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === "string")
  }
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed)
        ? parsed.filter((t): t is string => typeof t === "string")
        : null
    } catch {
      return null
    }
  }
  return null
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true"
}

function normalizeOpData(opData: Record<string, unknown>): Partial<IdeaUpdate & IdeaUpsert> {
  const normalized: Partial<IdeaUpdate & IdeaUpsert> = {}

  if (opData.content !== undefined) normalized.content = String(opData.content)
  if (opData.source !== undefined) {
    normalized.source = VALID_SOURCES.includes(opData.source as IdeaSource)
      ? (opData.source as IdeaSource)
      : "web"
  }
  if (opData.status !== undefined) {
    normalized.status = VALID_STATUSES.includes(opData.status as IdeaStatus)
      ? (opData.status as IdeaStatus)
      : "inbox"
  }
  if (opData.tags !== undefined) normalized.tags = parseTags(opData.tags)
  if (opData.pinned !== undefined) normalized.pinned = toBoolean(opData.pinned)
  if (opData.background_color !== undefined) {
    normalized.background_color =
      typeof opData.background_color === "string" && opData.background_color.trim() !== ""
        ? opData.background_color
        : null
  }
  if (opData.deleted_at !== undefined) {
    normalized.deleted_at =
      typeof opData.deleted_at === "string" && opData.deleted_at !== ""
        ? opData.deleted_at
        : null
  }
  if (opData.created_at !== undefined) {
    normalized.created_at =
      typeof opData.created_at === "string" ? opData.created_at : new Date().toISOString()
  }
  if (opData.updated_at !== undefined) {
    normalized.updated_at =
      typeof opData.updated_at === "string" ? opData.updated_at : new Date().toISOString()
  }

  return normalized
}

async function applyOp(op: UploadOp, userId: string) {
  if (!ALLOWED_TABLES.has(op.table)) {
    return { ok: false, error: `Unknown table: ${op.table}` }
  }

  switch (op.op) {
    case "PUT": {
      if (!op.opData || typeof op.opData.content !== "string" || !op.opData.content.trim()) {
        return { ok: false, error: `PUT ${op.table}/${op.id}: content is required` }
      }
      const values = normalizeOpData(op.opData)
      const upserted = await upsertIdea({
        id: op.id,
        userId,
        values: { ...values, content: values.content as string },
      })
      if (!upserted) {
        return { ok: false, error: `PUT ${op.table}/${op.id}: failed to upsert` }
      }
      return { ok: true }
    }
    case "PATCH": {
      if (!op.opData || Object.keys(op.opData).length === 0) {
        return { ok: false, error: `PATCH ${op.table}/${op.id}: no data` }
      }
      const values = normalizeOpData(op.opData)
      const updated = await updateIdea({ id: op.id, userId, values })
      if (!updated) {
        return { ok: false, error: `PATCH ${op.table}/${op.id}: idea not found` }
      }
      return { ok: true }
    }
    case "DELETE": {
      const deleted = await deleteIdea({ id: op.id, userId })
      if (!deleted) {
        return { ok: false, error: `DELETE ${op.table}/${op.id}: idea not found` }
      }
      return { ok: true }
    }
    default:
      return { ok: false, error: `Unknown operation: ${(op as UploadOp).op}` }
  }
}

// POST - Receives queued offline writes from the client's uploadData().
// Auth/infrastructure failures return non-2xx so the client keeps its local
// queue and retries. Only permanently invalid operations return 2xx, so the
// client can drop them and continue without blocking the queue forever.
export async function POST(request: NextRequest) {
  let userId: string | null
  try {
    userId = await getAuthenticatedUserId(request)
  } catch (error) {
    console.error("Failed to authenticate upload:", error)
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 401 },
    )
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    )
  }

  let body: { operations?: UploadOp[] }
  try {
    body = await request.json()
  } catch (error) {
    console.error("Invalid upload payload:", error)
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  const operations = Array.isArray(body.operations) ? body.operations : []
  const errors: string[] = []
  let retryable = false

  for (const op of operations) {
    try {
      const result = await applyOp(op, userId)
      if (!result.ok && result.error) {
        errors.push(result.error)
      }
    } catch (error) {
      console.error("Failed to apply upload operation:", error)
      retryable = true
      errors.push(`Failed to apply ${op?.op ?? "unknown"} on ${op?.table ?? "unknown"}`)
    }
  }

  if (retryable) {
    return NextResponse.json(
      { success: false, retryable: true, errors },
      { status: 503 },
    )
  }

  if (errors.length > 0) {
    console.warn("Upload completed with errors:", errors)
    return NextResponse.json({ success: false, errors }, { status: 200 })
  }

  return NextResponse.json({ success: true })
}
