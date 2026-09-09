# Offline Outbox Pattern Implementation Plan

## Overview

Implement the Manual Outbox Pattern using IndexedDB (via Dexie) to enable offline idea capture for Trojes. This restores the offline-first capability that was lost when PowerSync was removed.

**Goal:** When a user creates a note offline, it saves instantly to IndexedDB and syncs to Turso when back online. The UI updates immediately with no loading states.

---

## Architecture

```text
User types idea
      │
      ▼
  ┌──────────────────────┐
  │ Dexie (IndexedDB)    │   ← 0ms write, instant UI
  │  outbox table:       │
  │   { id, content,     │
  │     status, userId,  │
  │     createdAt }      │
  └──────────┬───────────┘
             │
        ┌────┴────┐
    ONLINE?    OFFLINE?
        │         │
        ▼         ▼
  POST /api/ideas   Waits in IndexedDB
        │         window.addEventListener('online')
        │              │
        ▼              ▼
  Turso DB        POST /api/ideas
  200 OK          200 OK
        │              │
        ▼              ▼
  Cleared from     Cleared from
  outbox           outbox
```

---

## File Structure

```diff
lib/
+├── outbox/
+│   ├── db.ts              # Dexie schema + database setup
+│   ├── idea-repository.ts # Local CRUD operations
+│   └── sync.ts            # Online listener + retry logic
+├── offline-identity.ts    # Restored: resolveUserId, isOnline
hooks/
+├── use-offline-ideas.ts   # SWR + outbox integration
+└── use-hydrated.ts        # Already exists, keep as-is
components/
+├── offline-indicator.tsx  # Optional: show sync status
```

---

## Step 1: Install Dependencies

```bash
bun add dexie
```

**Why Dexie:** Thin wrapper over IndexedDB with type safety, ~5 KB gzipped. No heavy dependencies.

---

## Step 2: Create IndexedDB Schema

**File: `lib/outbox/db.ts`**

```typescript
import Dexie, { type EntityTable } from "dexie"

interface OutboxItem {
  id: string           // UUID generated client-side
  content: string      // Idea content
  status: "pending" | "synced" | "failed"
  userId: string       // From NextAuth session
  createdAt: string    // ISO timestamp
  retryCount: number   // For exponential backoff
  lastError?: string   // For debugging
}

interface CachedIdea {
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
  isLocal: boolean     // true = created offline, not yet synced
}

const db = new Dexie("trojes-offline") as Dexie & {
  outbox: EntityTable<OutboxItem, "id">
  ideas: EntityTable<CachedIdea, "id">
}

db.version(1).stores({
  outbox: "id, status, userId, createdAt",
  ideas: "id, userId, status, created_at, isLocal",
})

export type { OutboxItem, CachedIdea }
export { db }
```

**Key design decisions:**
- `outbox` table: Queue of pending writes (creates, updates, deletes)
- `ideas` table: Local cache of synced ideas for offline reads
- `isLocal` flag: Distinguishes offline-created ideas from synced ones
- UUID generated client-side: Avoids conflicts when multiple offline writes sync

---

## Step 3: Create Idea Repository

**File: `lib/outbox/idea-repository.ts`**

```typescript
import { db, type OutboxItem, type CachedIdea } from "./db"
import { v4 as uuidv4 } from "crypto"  // Use Web Crypto API

// Generate UUID without external dependency
function generateId(): string {
  return crypto.randomUUID()
}

export async function saveIdeaLocally(
  content: string,
  userId: string,
): Promise<CachedIdea> {
  const id = generateId()
  const now = new Date().toISOString()

  const cachedIdea: CachedIdea = {
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
    userId,
    isLocal: true,
  }

  const outboxItem: OutboxItem = {
    id,
    content: content.trim(),
    status: "pending",
    userId,
    createdAt: now,
    retryCount: 0,
  }

  // Write to both tables atomically
  await db.transaction("rw", [db.ideas, db.outbox], async () => {
    await db.ideas.put(cachedIdea)
    await db.outbox.put(outboxItem)
  })

  return cachedIdea
}

export async function getCachedIdeas(userId: string): Promise<CachedIdea[]> {
  return db.ideas
    .where("userId")
    .equals(userId)
    .reverse()
    .sortBy("created_at")
}

export async function markSynced(id: string): Promise<void> {
  await db.transaction("rw", [db.ideas, db.outbox], async () => {
    await db.ideas.update(id, { isLocal: false })
    await db.outbox.delete(id)
  })
}

export async function markFailed(id: string, error: string): Promise<void> {
  await db.outbox.update(id, {
    status: "failed",
    lastError: error,
    retryCount: { increment: 1 },
  })
}

export async function getPendingItems(): Promise<OutboxItem[]> {
  return db.outbox
    .where("status")
    .equals("pending")
    .toArray()
}

export async function removeIdea(id: string): Promise<void> {
  await db.transaction("rw", [db.ideas, db.outbox], async () => {
    await db.ideas.delete(id)
    await db.outbox.delete(id)
  })
}
```

---

## Step 4: Create Sync Engine

**File: `lib/outbox/sync.ts`**

```typescript
import { db, type OutboxItem } from "./db"
import { markSynced, markFailed, getPendingItems } from "./idea-repository"

const MAX_RETRIES = 5
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]  // Exponential backoff

async function syncOutboxItem(item: OutboxItem): Promise<boolean> {
  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: item.content,
        // Include ID for idempotency
        client_id: item.id,
      }),
    })

    if (res.ok) {
      await markSynced(item.id)
      return true
    }

    // Don't retry auth errors (401, 403)
    if (res.status === 401 || res.status === 403) {
      await markFailed(item.id, `Auth error: ${res.status}`)
      return false
    }

    // Retry server errors (5xx)
    if (res.status >= 500) {
      await markFailed(item.id, `Server error: ${res.status}`)
      return false
    }

    // Don't retry client errors (4xx except 401/403)
    await markFailed(item.id, `Client error: ${res.status}`)
    return false
  } catch (error) {
    // Network error - will retry on next online event
    await markFailed(item.id, `Network error: ${error}`)
    return false
  }
}

export async function syncOutbox(): Promise<void> {
  const pending = await getPendingItems()

  for (const item of pending) {
    if (item.retryCount >= MAX_RETRIES) {
      await markFailed(item.id, "Max retries exceeded")
      continue
    }

    const success = await syncOutboxItem(item)
    if (!success && item.retryCount < MAX_RETRIES) {
      // Wait before retrying next item
      const delay = RETRY_DELAYS[Math.min(item.retryCount, RETRY_DELAYS.length - 1)]
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export function setupOnlineListener(): () => void {
  const handleOnline = () => {
    console.log("[Outbox] Back online, syncing...")
    syncOutbox()
  }

  window.addEventListener("online", handleOnline)

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline)
  }
}

// Sync on page load if online
export function initSync(): void {
  if (navigator.onLine) {
    // Small delay to let app initialize
    setTimeout(syncOutbox, 1000)
  }
}
```

---

## Step 5: Create Offline Identity Module

**File: `lib/offline-identity.ts`** (restored from deleted)

```typescript
const STORAGE_KEY = "trojes:offline-user-id"

export function getCachedUserId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY)
}

export function setCachedUserId(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, userId)
}

export function clearCachedUserId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

export async function resolveUserId(): Promise<string | null> {
  try {
    // Try live session first
    const res = await fetch("/api/auth/session")
    const session = await res.json()
    const id = session?.user?.id
    if (id) {
      setCachedUserId(id)
      return id
    }
  } catch {
    // Fetch failed (offline) - fall through to cache
  }

  // Fallback to localStorage cache
  return getCachedUserId()
}
```

---

## Step 6: Create Hook for Offline Ideas

**File: `hooks/use-offline-ideas.ts`**

```typescript
"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { saveIdeaLocally, getCachedIdeas } from "@/lib/outbox/idea-repository"
import { resolveUserId } from "@/lib/offline-identity"
import { setupOnlineListener, initSync } from "@/lib/outbox/sync"
import type { Idea, IdeaStatus } from "@/types/idea"

interface UseOfflineIdeasOptions {
  status: IdeaStatus
  search?: string
  enabled?: boolean
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch")
    return r.json()
  })

export function useOfflineIdeas({
  status,
  search,
  enabled = true,
}: UseOfflineIdeasOptions) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [localIdeas, setLocalIdeas] = useState<Idea[]>([])
  const [isOnline, setIsOnline] = useState(true)

  // Setup online/offline listeners
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initialize sync on mount
    initSync()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Load local ideas from IndexedDB
  useEffect(() => {
    if (!userId) return

    const loadLocalIdeas = async () => {
      const cached = await getCachedIdeas(userId)
      // Filter to only unsynced local ideas
      const unsynced = cached
        .filter((idea) => idea.isLocal)
        .map((idea) => ({
          id: idea.id,
          content: idea.content,
          source: idea.source as Idea["source"],
          status: idea.status as IdeaStatus,
          tags: idea.tags ? JSON.parse(idea.tags) : null,
          pinned: idea.pinned,
          background_color: idea.background_color,
          created_at: idea.created_at,
          updated_at: idea.updated_at,
          deleted_at: idea.deleted_at,
        }))
      setLocalIdeas(unsynced)
    }

    loadLocalIdeas()
  }, [userId])

  // SWR fetcher for server ideas
  const params = new URLSearchParams()
  if (userId) params.set("status", status)
  if (search) params.set("search", search)
  params.set("limit", "50")

  const swrKey =
    enabled && userId ? `/api/ideas?${params.toString()}` : null

  const { data, error, isLoading, isValidating } = useSWR(swrKey, fetcher, {
    // Don't refetch when offline
    revalidateOnFocus: isOnline,
    revalidateOnReconnect: isOnline,
  })

  const serverIdeas: Idea[] = (data?.ideas ?? []).map(
    (row: Record<string, unknown>) => ({
      id: row.id as string,
      content: row.content as string,
      source: row.source as Idea["source"],
      status: row.status as IdeaStatus,
      tags: row.tags ? JSON.parse(row.tags as string) : null,
      pinned: Boolean(row.pinned),
      background_color: row.background_color as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      deleted_at: row.deleted_at as string | null,
    }),
  )

  // Merge: local ideas first, then server ideas (excluding duplicates)
  const serverIds = new Set(serverIdeas.map((i) => i.id))
  const mergedIdeas = [
    ...localIdeas.filter((i) => !serverIds.has(i.id)),
    ...serverIdeas,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const create = useCallback(
    async (content: string): Promise<{ ok: boolean }> => {
      const resolvedUserId = userId || (await resolveUserId())
      if (!resolvedUserId) return { ok: false }

      // Save locally first (instant)
      const localIdea = await saveIdeaLocally(content, resolvedUserId)

      // Update local state immediately
      setLocalIdeas((prev) => [localIdea as unknown as Idea, ...prev])

      // If online, also try to sync immediately
      if (isOnline) {
        try {
          const res = await fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: localIdea.content }),
          })

          if (res.ok) {
            // Mark as synced in background
            const { markSynced } = await import("@/lib/outbox/idea-repository")
            await markSynced(localIdea.id)

            // Remove from local ideas (will appear from server)
            setLocalIdeas((prev) => prev.filter((i) => i.id !== localIdea.id))

            // Revalidate SWR
            mutate(swrKey)
          }
        } catch {
          // Will retry on next online event
        }
      }

      return { ok: true }
    },
    [userId, isOnline, swrKey],
  )

  return {
    ideas: mergedIdeas,
    error,
    isLoading,
    isValidating,
    isOnline,
    create,
    // Other CRUD operations would follow similar pattern...
  }
}
```

---

## Step 7: Update Dashboard Component

**File: `components/app/dashboard.tsx`**

```diff
- import { optimisticCreateIdea } from "@/lib/create-idea"
+ import { useOfflineIdeas } from "@/hooks/use-offline-ideas"

  export function Dashboard({ user }: DashboardProps) {
    // ... existing hooks ...

+   const { create: createIdea, isOnline } = useOfflineIdeas({
+     status: "inbox",
+   })

    const handleCapture = useCallback(async (content: string) => {
-     await optimisticCreateIdea(content)
+     await createIdea(content)
    }, [createIdea])

    return (
      <div className="min-h-screen bg-background flex flex-col">
+       {!isOnline && (
+         <div className="bg-yellow-500/10 text-yellow-600 text-center py-1 text-sm">
+           You're offline — ideas will sync when reconnected
+         </div>
+       )}
        {/* ... rest of component ... */}
      </div>
    )
  }
```

---

## Step 8: Clean Up Dead References

**Files to update:**

1. **`tests/lib/create-idea.test.ts`** - Remove import of deleted `@/lib/offline-identity`
2. **`tests/lib/offline-identity.test.ts`** - Update to test new restored module
3. **`tests/components/settings-dialog.test.tsx`** - Remove mock of deleted module

---

## Step 9: Update Service Worker (Optional Enhancement)

**File: `app/sw.ts`**

Add background sync support for when the user comes back online:

```typescript
// Add to serwist config
backgroundSync: {
  entries: [
    {
      url: "/api/ideas",
      registration: "outbox-sync",
    },
  ],
},
```

---

## Implementation Order

1. **Install Dexie** (`bun add dexie`)
2. **Create `lib/outbox/db.ts`** - Schema definition
3. **Create `lib/outbox/idea-repository.ts`** - Local CRUD
4. **Create `lib/outbox/sync.ts`** - Online listener + retry
5. **Restore `lib/offline-identity.ts`** - User ID caching
6. **Create `hooks/use-offline-ideas.ts`** - SWR integration
7. **Update `components/app/dashboard.tsx`** - Use new hook
8. **Clean up test files** - Remove dead PowerSync references
9. **Test offline behavior** - Verify ideas save offline and sync on reconnect

---

## Testing Strategy

1. **Unit tests:** Test `idea-repository.ts` functions with mocked Dexie
2. **Integration tests:** Test `sync.ts` with mocked fetch
3. **Manual testing:**
   - Open DevTools → Network → Offline
   - Create idea → verify it appears in UI instantly
   - Check IndexedDB in DevTools → Application → Storage
   - Go back online → verify idea syncs to server
   - Check server database for the idea

---

## Migration Notes

- **No database migration needed** - This is client-side only
- **No API changes needed** - Existing endpoints work as-is
- **Backward compatible** - If IndexedDB is unavailable, falls back to current behavior
- **Progressive enhancement** - Works better when online, still functional offline

---

## Success Criteria

- [ ] Ideas save instantly when offline (0ms UI update)
- [ ] Ideas appear in UI immediately after creation
- [ ] Ideas sync to Turso when back online
- [ ] No data loss during offline → online transition
- [ ] Service worker caches app shell for offline browsing
- [ ] Dead PowerSync references cleaned up
- [ ] Tests pass with new offline module
