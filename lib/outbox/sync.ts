import type { OutboxItem } from "./db"
import { markSynced, markFailed, getPendingItems } from "./idea-repository"

const MAX_RETRIES = 5
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]

let syncing = false

async function syncOutboxItem(item: OutboxItem): Promise<boolean> {
  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: item.content,
        client_id: item.id,
      }),
    })

    if (res.ok) {
      await markSynced(item.id)
      return true
    }

    if (res.status === 401 || res.status === 403) {
      await markFailed(item.id, `Auth error: ${res.status}`)
      return false
    }

    if (res.status >= 500) {
      await markFailed(item.id, `Server error: ${res.status}`)
      return false
    }

    await markFailed(item.id, `Client error: ${res.status}`)
    return false
  } catch (error) {
    await markFailed(item.id, `Network error: ${error}`)
    return false
  }
}

export async function syncOutbox(): Promise<void> {
  if (syncing) return
  syncing = true

  try {
    const pending = await getPendingItems()

    const syncPromises = pending.map(async (item) => {
      if (item.retryCount >= MAX_RETRIES) {
        await markFailed(item.id, "Max retries exceeded")
        return
      }

      const success = await syncOutboxItem(item)
      if (!success && item.retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[Math.min(item.retryCount, RETRY_DELAYS.length - 1)]
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    })

    await Promise.all(syncPromises)
  } finally {
    syncing = false
  }
}

export function initSync(): void {
  window.addEventListener("online", () => {
    console.log("[Outbox] Back online, syncing...")
    syncOutbox()
  })

  if (navigator.onLine) {
    syncOutbox()
  }
}
