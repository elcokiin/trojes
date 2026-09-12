import { Context, Effect, Layer, Schedule } from "effect"
import type { OutboxItem } from "./db"
import { GetPendingItems, MarkSynced, MarkFailed } from "./idea-repository"
import { SyncError, NetworkError, RepositoryError } from "@/lib/errors"

const MAX_RETRIES = 5
const RETRY_BASE_DELAY = 1000

let syncing = false

function syncOutboxItem(item: OutboxItem): Effect.Effect<boolean, SyncError | NetworkError | RepositoryError> {
  return Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () =>
        fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: item.content,
            client_id: item.id,
          }),
        }),
      catch: (cause) => new NetworkError({ cause, url: "/api/ideas" }),
    })

    if (res.ok) {
      yield* MarkSynced.execute(item.id)
      return true
    }

    if (res.status === 401 || res.status === 403) {
      yield* MarkFailed.execute(item.id, `Auth error: ${res.status}`)
      return false
    }

    if (res.status >= 500) {
      yield* MarkFailed.execute(item.id, `Server error: ${res.status}`)
      return false
    }

    yield* MarkFailed.execute(item.id, `Client error: ${res.status}`)
    return false
  })
}

function syncItemWithRetry(item: OutboxItem): Effect.Effect<void, SyncError | NetworkError | RepositoryError> {
  return Effect.gen(function* () {
    if (item.retryCount >= MAX_RETRIES) {
      yield* MarkFailed.execute(item.id, "Max retries exceeded")
      return
    }

    const retrySchedule = Schedule.concat(
      Schedule.recurs(MAX_RETRIES - item.retryCount),
      Schedule.exponential(RETRY_BASE_DELAY),
    )

    yield* syncOutboxItem(item).pipe(
      Effect.catch(() => Effect.succeed(false)),
      Effect.repeat(retrySchedule),
      Effect.catch(() => Effect.void),
    )
  })
}

export interface SyncServiceOps {
  readonly syncOutbox: () => Effect.Effect<void, SyncError | NetworkError | RepositoryError>
  readonly initSync: () => Effect.Effect<void, SyncError | NetworkError | RepositoryError>
}

export const SyncService = Context.Service<SyncServiceOps>("SyncService")

function syncOutboxImpl(): Effect.Effect<void, SyncError | NetworkError | RepositoryError> {
  return Effect.gen(function* () {
    if (syncing) return
    syncing = true

    try {
      const pending = yield* GetPendingItems.execute()

      yield* Effect.forEach(pending, (item) => syncItemWithRetry(item), {
        concurrency: "unbounded",
      })
    } finally {
      syncing = false
    }
  })
}

function initSyncImpl(): Effect.Effect<void, SyncError | NetworkError | RepositoryError> {
  return Effect.gen(function* () {
    yield* Effect.try({
      try: () => {
        window.addEventListener("online", () => {
          console.log("[Outbox] Back online, syncing...")
          Effect.runPromise(syncOutboxImpl())
        })
      },
      catch: (cause) => new SyncError({ cause }),
    })

    const isOnline = yield* Effect.try({
      try: () => navigator.onLine,
      catch: () => new SyncError({ cause: new Error("Failed to check online status") }),
    })

    if (isOnline) {
      yield* syncOutboxImpl()
    }
  })
}

export const SyncServiceLive = Layer.succeed(
  SyncService,
  {
    syncOutbox: syncOutboxImpl,
    initSync: initSyncImpl,
  },
)
