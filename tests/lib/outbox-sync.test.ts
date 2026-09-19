import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Effect } from "effect"

const getPendingItems = vi.hoisted(() => vi.fn())
const markSynced = vi.hoisted(() => vi.fn())
const markFailed = vi.hoisted(() => vi.fn())

vi.mock("@/lib/outbox/idea-repository", () => ({
  GetPendingItems: { execute: getPendingItems },
  MarkSynced: { execute: markSynced },
  MarkFailed: { execute: markFailed },
}))

import { SyncService, SyncServiceLive, resetOutboxSync } from "@/lib/outbox/sync"
import { useIdeasStore } from "@/stores/ideas-store"
import type { OutboxItem } from "@/lib/outbox/db"
import type { Idea } from "@/types/idea"

function makeIdea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: "local-1",
    content: "captured offline",
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

function makeOutboxItem(overrides: Partial<OutboxItem> = {}): OutboxItem {
  return {
    id: "local-1",
    content: "captured offline",
    status: "pending",
    userId: "user-1",
    createdAt: "2024-06-01T12:00:00Z",
    retryCount: 0,
    ...overrides,
  }
}

function seedStore() {
  useIdeasStore.setState({
    ideas: [makeIdea()],
    pendingIds: new Set(["local-1"]),
    activeUserId: "user-1",
    hydrated: true,
    isOnline: true,
    queries: {},
    loadedQueries: new Set(),
    cacheOutbox: [],
  })
}

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    value,
    configurable: true,
    writable: true,
  })
}

function runSync() {
  return Effect.runPromise(
    Effect.provide(
      Effect.gen(function* () {
        const sync = yield* SyncService
        yield* sync.syncOutbox()
      }),
      SyncServiceLive,
    ) as Effect.Effect<void>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  resetOutboxSync()
  seedStore()
  getPendingItems.mockImplementation(() => Effect.succeed([]))
  markSynced.mockImplementation(() => Effect.succeed(undefined))
  markFailed.mockImplementation(() => Effect.succeed(undefined))
  setOnline(true)
})

afterEach(() => {
  resetOutboxSync()
  setOnline(true)
  vi.unstubAllGlobals()
})

describe("SyncService.syncOutbox", () => {
  it("does not touch the outbox while offline", async () => {
    setOnline(false)

    await runSync()

    expect(getPendingItems).not.toHaveBeenCalled()
    expect(markFailed).not.toHaveBeenCalled()
  })

  it("commits a local capture to the server and flips it out of pending", async () => {
    getPendingItems.mockImplementation(() =>
      Effect.succeed([makeOutboxItem()]),
    )
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ idea: makeIdea() }),
      }),
    )

    await runSync()

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as [string, RequestInit]
    expect(url).toBe("/api/ideas")
    // The local id rides along so the permanent row is the same idea.
    expect(JSON.parse(init.body as string)).toEqual({
      content: "captured offline",
      client_id: "local-1",
    })

    expect(markSynced).toHaveBeenCalledWith("local-1")
    expect(markFailed).not.toHaveBeenCalled()
    expect(useIdeasStore.getState().pendingIds.size).toBe(0)
    expect(useIdeasStore.getState().ideas).toEqual([makeIdea()])
  })

  it("stops retrying a rejected credential and marks the item failed", async () => {
    getPendingItems.mockImplementation(() =>
      Effect.succeed([makeOutboxItem()]),
    )
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    )

    await runSync()

    expect(markSynced).not.toHaveBeenCalled()
    expect(markFailed).toHaveBeenCalledWith("local-1", "Auth error")
    // Pending state is untouched: the capture still renders as unsynced.
    expect(useIdeasStore.getState().pendingIds).toEqual(new Set(["local-1"]))
  })

  it("gives up once the retry budget is spent", async () => {
    getPendingItems.mockImplementation(() =>
      Effect.succeed([makeOutboxItem({ retryCount: 5 })]),
    )
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await runSync()

    expect(markFailed).toHaveBeenCalledWith("local-1", "Max retries exceeded")
    expect(fetchMock).not.toHaveBeenCalled()
  })
})