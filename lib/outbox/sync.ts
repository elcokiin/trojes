import { Context, Effect, Layer, Schedule } from "effect"
import type { OutboxItem } from "./db"
import { GetPendingItems, MarkSynced, MarkFailed } from "./idea-repository"
import { SyncError, RepositoryError } from "@/lib/errors"
import { useIdeasStore } from "@/stores/ideas-store"
import { normalizeIdea } from "@/lib/ideas"

const MAX_RETRIES = 5
const RETRY_BASE_DELAY = 1000

let syncing = false

type SyncOutcome = "synced" | "retry" | "failed"

function isOnline(): Effect.Effect<boolean, SyncError> {
  return Effect.try({
    try: () => (typeof navigator === "undefined" ? true : navigator.onLine),
    catch: (cause) => new SyncError({ cause }),
  })
}

/**
 * One attempt at pushing a single captured idea to the permanent store.
 *
 * `retry` means "this could work later" (offline, 5xx, 429). `failed` means
 * retrying cannot help (a rejected credential). Nothing is deleted from the
 * outbox here — only a successful POST calls `MarkSynced`.
 */
function syncOutboxItem(
  item: OutboxItem,
): Effect.Effect<SyncOutcome, RepositoryError> {
  return Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () =>
        fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: item.content, client_id: item.id }),
        }),
      catch: (cause) => new SyncError({ cause, itemId: item.id }),
    }).pipe(Effect.match({ onFailure: () => null, onSuccess: (response) => response }))

    if (!res) return "retry"

    if (res.ok) {
      const payload = yield* Effect.promise(() => res.json().catch(() => null))
      yield* MarkSynced.execute(item.id)
      // The permanent row carries the same id (the server honours
      // `client_id`), so this replaces the local row in place.
      useIdeasStore
        .getState()
        .markPendingSynced(
          item.id,
          payload?.idea ? normalizeIdea(payload.idea) : undefined,
        )
      return "synced"
    }

    if (res.status === 401 || res.status === 403) return "failed"

    return "retry"
  })
}

/**
 * Bounded backoff retry around a single capture.
 *
 * `Effect.retry` only retries typed failures, so a `retry` outcome is promoted
 * to one. The schedule must be bounded (`times`) or the item would be POSTed
 * forever: `Effect.repeat` with an endless schedule never completes, which also
 * leaves the `syncing` guard stuck on.
 */
function syncItemWithRetry(
  item: OutboxItem,
): Effect.Effect<void, SyncError | RepositoryError> {
  return Effect.gen(function* () {
    if (item.retryCount >= MAX_RETRIES) {
      yield* MarkFailed.execute(item.id, "Max retries exceeded")
      return
    }

    const attempts = MAX_RETRIES - item.retryCount

    const outcome = yield* syncOutboxItem(item).pipe(
      Effect.flatMap((result) =>
        result === "retry"
          ? Effect.fail(new SyncError({ cause: "retryable", itemId: item.id }))
          : Effect.succeed(result),
      ),
      Effect.retry({
        schedule: Schedule.exponential(RETRY_BASE_DELAY),
        times: attempts,
      }),
      Effect.match({
        onFailure: () => "retry" as const,
        onSuccess: (result) => result,
      }),
    )

    if (outcome === "failed") {
      yield* MarkFailed.execute(item.id, "Auth error")
    } else if (outcome === "retry") {
      yield* MarkFailed.execute(item.id, "Sync failed; will retry when online")
    }
  })
}

export interface SyncServiceOps {
  readonly syncOutbox: () => Effect.Effect<void, SyncError | RepositoryError>
  readonly initSync: () => Effect.Effect<void, SyncError | RepositoryError>
}

export const SyncService = Context.Service<SyncServiceOps>("SyncService")

function syncOutboxImpl(): Effect.Effect<void, SyncError | RepositoryError> {
  return Effect.gen(function* () {
    if (syncing) return

    // Being offline is not a failure: without this guard a capture made offline
    // would burn its retry budget and be marked `failed`. It stays `pending`
    // and is pushed by the `online` listener in `initSync`.
    const online = yield* isOnline()
    if (!online) return

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

/**
 * Fire-and-forget push of everything the outbox owes the server.
 *
 * Called by the IndexedDB controller right after a locally-created idea has
 * been committed to disk — that local commit is what triggers the permanent
 * (Turso) write. Safe to call at any time: it no-ops while offline, while
 * another sync is running, and when the outbox is empty.
 */
export function requestOutboxSync(): void {
  Effect.runFork(
    syncOutboxImpl().pipe(
      Effect.catch((error) =>
        Effect.logError("[Outbox] sync failed", error),
      ),
    ),
  )
}

function initSyncImpl(): Effect.Effect<void, SyncError | RepositoryError> {
  return Effect.gen(function* () {
    yield* Effect.try({
      try: () => {
        window.addEventListener("online", () => {
          requestOutboxSync()
        })
      },
      catch: (cause) => new SyncError({ cause }),
    })

    const online = yield* isOnline()
    if (online) {
      yield* syncOutboxImpl()
    }
  })
}

export const SyncServiceLive = Layer.succeed(SyncService, {
  syncOutbox: syncOutboxImpl,
  initSync: initSyncImpl,
})

/** Test helper: clear the in-flight guard. */
export function resetOutboxSync(): void {
  syncing = false
}