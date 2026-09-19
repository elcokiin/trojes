import { Context, Effect, Layer, Semaphore } from "effect"
import { IdeasCacheError } from "@/lib/errors"
import { useIdeasStore } from "@/stores/ideas-store"
import { GetUnsyncedItems, outboxItemToIdea } from "./idea-repository"
import { requestOutboxSync } from "./sync"
import { ApplyCacheMessages, ReadCachedIdeas, toIdea } from "./ideas-cache"

/**
 * IndexedDB controller.
 *
 * The zustand store is the single in-memory source of truth and never talks to
 * Dexie. Instead it appends `IdeasCacheMessage`s to `useIdeasStore.cacheOutbox`.
 * This service owns the other half of that contract:
 *
 *   - `start()`  subscribes to the store's message queue and drains it.
 *   - `flush()`  writes every queued message to Dexie in one transaction, then
 *                acks exactly the messages it wrote. Messages that arrive during
 *                the write stay queued and are drained on the next pass.
 *   - `hydrate()` flushes first (so the disk read is complete), then seeds the
 *                store from the cached ideas plus the unsynced outbox ids.
 *
 * Once a locally-created idea is durable on disk, the controller hands off to
 * the sync service (`requestOutboxSync`), which is what pushes it to the
 * permanent store. Persistence decides *when*; sync decides *how*.
 */
export interface IdeasCacheControllerOps {
  readonly start: () => Effect.Effect<void, IdeasCacheError>
  readonly stop: () => Effect.Effect<void>
  readonly flush: () => Effect.Effect<void, IdeasCacheError>
  readonly hydrate: (userId: string) => Effect.Effect<void, IdeasCacheError>
}

export const IdeasCacheController =
  Context.Service<IdeasCacheControllerOps>("IdeasCacheController")

// Module scope on purpose: AppLayer is rebuilt on every `Effect.provide`, so
// per-layer state would register a new store subscription each time.
let unsubscribe: (() => void) | null = null

// One writer at a time: a concurrent flush waits for the in-flight one instead
// of skipping it, which is what lets hydrate() trust "flush, then read".
const flushSemaphore = Semaphore.makeUnsafe(1)

/**
 * Drains the queue until it is empty. Returns whether a locally-created idea
 * was part of what got persisted — the signal that the permanent store is now
 * owed a write.
 */
function drainImpl(): Effect.Effect<boolean, IdeasCacheError> {
  return Effect.gen(function* () {
    let persistedLocalIdea = false

    while (true) {
      const queue = useIdeasStore.getState().cacheOutbox
      if (queue.length === 0) return persistedLocalIdea

      if (
        queue.some(
          (entry) =>
            entry.message.type === "upsert" && entry.message.local === true,
        )
      ) {
        persistedLocalIdea = true
      }

      // Messages queued while this write is in flight keep a higher seq, so
      // acking up to throughSeq leaves them for the next pass.
      const throughSeq = queue[queue.length - 1].seq
      yield* ApplyCacheMessages.execute(queue.map((entry) => entry.message))
      useIdeasStore.getState().ackCacheMessages(throughSeq)
    }
  })
}

function flushImpl(): Effect.Effect<void, IdeasCacheError> {
  return flushSemaphore.withPermits(1)(drainImpl()).pipe(
    // Outside the permit: the sync this kicks off ends in another store write
    // (`replace`), which triggers another flush. It must not run under the
    // lock the drain needs.
    Effect.tap((persistedLocalIdea) =>
      persistedLocalIdea
        ? Effect.sync(() => requestOutboxSync())
        : Effect.void,
    ),
    Effect.map(() => undefined),
  )
}

function hydrateImpl(userId: string): Effect.Effect<void, IdeasCacheError> {
  return Effect.gen(function* () {
    // Anything still queued is newer than what is on disk: write it first so
    // the read below cannot clobber it.
    yield* flushImpl()

    const rows = yield* ReadCachedIdeas.execute(userId)
    const unsynced = yield* GetUnsyncedItems.execute().pipe(
      Effect.mapError(
        (cause) =>
          new IdeasCacheError({ cause, operation: "getUnsyncedItems" }),
      ),
    )

    const mine = unsynced.filter((item) => item.userId === userId)
    const cachedIds = new Set(rows.map((row) => row.id))

    useIdeasStore.getState().hydrate({
      userId,
      ideas: [
        ...rows.map(toIdea),
        // The outbox row alone is enough to render: a capture whose idea row
        // has not been flushed yet (or whose flush failed) must not vanish.
        ...mine
          .filter((item) => !cachedIds.has(item.id))
          .map(outboxItemToIdea),
      ],
      unsyncedIds: mine.map((item) => item.id),
    })
  })
}

function startImpl(): Effect.Effect<void, IdeasCacheError> {
  return Effect.gen(function* () {
    if (!unsubscribe) {
      unsubscribe = useIdeasStore.subscribe((state, previous) => {
        if (state.cacheOutbox === previous.cacheOutbox) return
        if (state.cacheOutbox.length === 0) return

        Effect.runFork(
          flushImpl().pipe(
            Effect.catch((error) =>
              Effect.logError("[IdeasCache] failed to persist store changes", error),
            ),
          ),
        )
      })
    }

    yield* flushImpl()
  })
}

function stopImpl(): Effect.Effect<void> {
  return Effect.sync(() => {
    unsubscribe?.()
    unsubscribe = null
  })
}

export const IdeasCacheControllerLive = Layer.succeed(IdeasCacheController, {
  start: startImpl,
  stop: stopImpl,
  flush: flushImpl,
  hydrate: hydrateImpl,
})

/**
 * Imperative hydration for non-Effect call sites (window focus). Uses the same
 * module-level queue state as the service.
 */
export function hydrateIdeasCache(userId: string): Promise<void> {
  return Effect.runPromise(hydrateImpl(userId))
}

/** Test helper: drop the store subscription. */
export function resetIdeasCacheController(): void {
  unsubscribe?.()
  unsubscribe = null
}