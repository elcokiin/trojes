import Dexie, { type EntityTable } from "dexie"

export interface OutboxItem {
  id: string
  content: string
  status: "pending" | "synced" | "failed"
  userId: string
  createdAt: string
  retryCount: number
  lastError?: string
}

export interface CachedIdea {
  id: string
  content: string
  source: string
  status: string
  tags: string | null
  pinned: boolean
  background_color: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  userId: string
  isLocal: boolean
}

const db = new Dexie("trojes-offline") as Dexie & {
  outbox: EntityTable<OutboxItem, "id">
  ideas: EntityTable<CachedIdea, "id">
}

db.version(1).stores({
  outbox: "id, status, userId, createdAt",
  ideas: "id, userId, status, created_at, isLocal",
})

export { db }
