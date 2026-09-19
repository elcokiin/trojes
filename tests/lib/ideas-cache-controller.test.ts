import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Effect } from "effect"

const applyCacheMessages = vi.hoisted(() => vi.fn())
const readCachedIdeas = vi.hoisted(() => vi.fn())
const getUnsyncedItems = vi.hoisted(() => vi.fn())
const requestOutboxSync = vi.hoisted(() => vi.fn())

vi.mock("@/lib/outbox/ideas-cache", () => ({
  ApplyCacheMessages: { execute: applyCacheMessages },
  ReadCachedIdeas: { execute: readCachedIdeas },
  toIdea: (row: { id: string }) => ({ id: row.id, content: row.id }),
}))

vi.mock("@/lib/outbox/idea-repository", () => ({
  GetUnsyncedItems: { execute: getUnsyncedItems },
  outboxItemToIdea: (item: { id: string; content: string }) => ({
    id: item.id,
    content: item.content,
  }),
}))

vi.mock("@/lib/outbox/sync", () => ({ requestOutboxSync }))

import {
  IdeasCacheController,
  IdeasCacheControllerLive,
  resetIdeasCacheController,
  type IdeasCacheControllerOps,
} from "@/lib/outbox/ideas-cache-controller"
import { useIdeasStore } from "@/stores/ideas-store"
import type { Idea } from "@/types/idea"

function makeIdea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: "idea-1",
    content: "First idea",
    source: "web",
    status: "inbox",
    tags: null,
    pinned: false,
    background_color: null,
    created_at: "2024-06-01T12:00:00Z",
    updated_at: "2024-06-01T12:00:00Z",
    deleted_at: null,
    ...overrides,
  }
}

function resetStore() {
  useIdeasStore.setState({
    ideas: [],
    pendingIds: new Set(),
    activeUserId: null,
    hydrated: false,
    isOnline: true,
    queries: {},
    loadedQueries: new Set(),
    cacheOutbox: [],
  })
}

function hydrateStore(userId = "user-1") {
  useIdeasStore.getState().hydrate({ userId, ideas: [], unsyncedIds: [] })
}

function withController<A, E>(
  fn: (controller: IdeasCacheControllerOps) => Effect.Effect<A, E>,
): Effect.Effect<A, E, IdeasCacheController> {
  return Effect.gen(function* () {
    const controller = yield* IdeasCacheController
    return yield* fn(controller)
  })
}

function run<A, E>(effect: Effect.Effect<A, E, IdeasCacheController>) {
  return Effect.runPromise(
    Effect.provide(effect, IdeasCacheControllerLive) as Effect.Effect<A, E>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
  applyCacheMessages.mockImplementation(() => Effect.succeed(undefined))
  readCachedIdeas.mockReturnValue(Effect.succeed([]))
  getUnsyncedItems.mockReturnValue(Effect.succeed([]))
})

afterEach(() => {
  resetIdeasCacheController()
})

describe("IdeasCacheController.flush", () => {
  it("writes the queued messages and acks exactly what it wrote", async () => {
    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))

    await run(withController((c) => c.flush()))

    expect(applyCacheMessages).toHaveBeenCalledTimes(1)
    const [messages] = applyCacheMessages.mock.calls[0] as [
      { type: string; ideas: Idea[] }[],
    ]
    expect(messages).toHaveLength(1)
    expect(messages[0].type).toBe("upsert")
    expect(useIdeasStore.getState().cacheOutbox).toEqual([])
    expect(requestOutboxSync).not.toHaveBeenCalled()
  })

  it("hands off to the server once a locally-created idea is on disk", async () => {
    hydrateStore()
    useIdeasStore.getState().addPendingIdea(makeIdea({ id: "local" }))

    await run(withController((c) => c.flush()))

    expect(requestOutboxSync).toHaveBeenCalledTimes(1)
  })

  it("does not hand off when the local write failed", async () => {
    hydrateStore()
    useIdeasStore.getState().addPendingIdea(makeIdea({ id: "local" }))
    applyCacheMessages.mockReturnValue(Effect.fail(new Error("quota exceeded")))

    await expect(
      run(withController((c) => c.flush())),
    ).rejects.toBeDefined()

    expect(requestOutboxSync).not.toHaveBeenCalled()
  })

  it("does nothing when the queue is empty", async () => {
    await run(withController((c) => c.flush()))

    expect(applyCacheMessages).not.toHaveBeenCalled()
  })

  it("keeps messages queued when the write fails", async () => {
    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))
    applyCacheMessages.mockReturnValue(Effect.fail(new Error("quota exceeded")))

    await expect(
      run(withController((c) => c.flush())),
    ).rejects.toBeDefined()

    expect(useIdeasStore.getState().cacheOutbox).toHaveLength(1)
  })

  it("waits for an in-flight flush instead of skipping it", async () => {
    const order: string[] = []
    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))

    applyCacheMessages.mockImplementationOnce(() =>
      Effect.promise(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
        order.push("write")
      }),
    )
    readCachedIdeas.mockImplementation(() =>
      Effect.sync(() => {
        order.push("read")
        return []
      }),
    )

    await Promise.all([
      run(withController((c) => c.flush())),
      run(withController((c) => c.hydrate("user-1"))),
    ])

    expect(order).toEqual(["write", "read"])
    expect(useIdeasStore.getState().cacheOutbox).toEqual([])
  })

  it("drains messages that arrive while a write is in flight", async () => {
    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))

    applyCacheMessages.mockImplementationOnce(() =>
      Effect.sync(() => {
        useIdeasStore.getState().upsertIdea(makeIdea({ id: "b" }))
      }),
    )

    await run(withController((c) => c.flush()))

    expect(applyCacheMessages).toHaveBeenCalledTimes(2)
    expect(useIdeasStore.getState().cacheOutbox).toEqual([])
  })
})

describe("IdeasCacheController.hydrate", () => {
  it("flushes queued writes before reading the cache", async () => {
    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))
    readCachedIdeas.mockReturnValue(Effect.succeed([]))

    await run(withController((c) => c.hydrate("user-1")))

    expect(applyCacheMessages).toHaveBeenCalledTimes(1)
    expect(applyCacheMessages.mock.invocationCallOrder[0]).toBeLessThan(
      readCachedIdeas.mock.invocationCallOrder[0],
    )
  })

  it("seeds the store from cached rows plus unsynced outbox ids", async () => {
    readCachedIdeas.mockReturnValue(
      Effect.succeed([{ id: "cached-1" }]),
    )
    getUnsyncedItems.mockReturnValue(
      Effect.succeed([
        { id: "pending-1", userId: "user-1", content: "first" },
        { id: "other-user", userId: "user-2", content: "nope" },
      ]),
    )

    await run(withController((c) => c.hydrate("user-1")))

    const state = useIdeasStore.getState()
    expect(readCachedIdeas).toHaveBeenCalledWith("user-1")
    expect(state.activeUserId).toBe("user-1")
    expect(state.hydrated).toBe(true)
    expect(state.ideas.map((i) => i.id)).toEqual(["cached-1", "pending-1"])
    expect(state.pendingIds).toEqual(new Set(["pending-1"]))
  })

  it("rebuilds an unsynced idea that has no cached row", async () => {
    readCachedIdeas.mockReturnValue(Effect.succeed([]))
    getUnsyncedItems.mockReturnValue(
      Effect.succeed([
        { id: "pending-1", userId: "user-1", content: "crash window" },
      ]),
    )

    await run(withController((c) => c.hydrate("user-1")))

    expect(useIdeasStore.getState().ideas).toEqual([
      { id: "pending-1", content: "crash window" },
    ])
    expect(useIdeasStore.getState().pendingIds).toEqual(new Set(["pending-1"]))
  })
})

describe("IdeasCacheController.start", () => {
  it("persists store changes as soon as they are queued", async () => {
    await run(withController((c) => c.start()))

    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))

    await vi.waitFor(() => expect(applyCacheMessages).toHaveBeenCalledTimes(1))
    await vi.waitFor(() =>
      expect(useIdeasStore.getState().cacheOutbox).toEqual([]),
    )
  })

  it("registers a single subscription even when started repeatedly", async () => {
    await run(withController((c) => c.start()))
    await run(withController((c) => c.start()))

    hydrateStore()
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))

    await vi.waitFor(() => expect(applyCacheMessages).toHaveBeenCalledTimes(1))
    expect(applyCacheMessages).toHaveBeenCalledTimes(1)
  })
})