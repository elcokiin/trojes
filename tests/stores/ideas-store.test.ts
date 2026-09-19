import { beforeEach, describe, expect, it } from "vitest"
import {
  useIdeasStore,
  selectIdeas,
  selectPinnedIdeas,
} from "@/stores/ideas-store"
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

beforeEach(() => {
  resetStore()
})

describe("ideas-store hydrate", () => {
  it("seeds ideas, pending ids and ownership from the IndexedDB cache", () => {
    const cached = makeIdea({ id: "cached-1" })
    const pending = makeIdea({ id: "pending-1" })

    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [cached, pending],
      unsyncedIds: ["pending-1"],
    })

    const state = useIdeasStore.getState()
    expect(state.activeUserId).toBe("user-1")
    expect(state.hydrated).toBe(true)
    expect(state.ideas.map((i) => i.id)).toEqual(["cached-1", "pending-1"])
    expect(state.pendingIds).toEqual(new Set(["pending-1"]))
  })

  it("does not emit cache messages, so hydration cannot loop through Dexie", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [makeIdea()],
      unsyncedIds: [],
    })

    expect(useIdeasStore.getState().cacheOutbox).toEqual([])
  })

  it("merges a rehydrate for the same user instead of dropping fetched rows", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [],
      unsyncedIds: [],
    })
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "from-server" }))

    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [makeIdea({ id: "from-cache" })],
      unsyncedIds: [],
    })

    expect(
      useIdeasStore
        .getState()
        .ideas.map((i) => i.id)
        .toSorted(),
    ).toEqual(["from-cache", "from-server"])
  })

  it("replaces the list when the owner changes", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [makeIdea({ id: "user-1-idea" })],
      unsyncedIds: [],
    })

    useIdeasStore.getState().hydrate({
      userId: "user-2",
      ideas: [makeIdea({ id: "user-2-idea" })],
      unsyncedIds: [],
    })

    expect(useIdeasStore.getState().ideas.map((i) => i.id)).toEqual([
      "user-2-idea",
    ])
  })
})

describe("ideas-store cache messages", () => {
  it("queues nothing before a user is known (nothing to attribute the change to)", () => {
    useIdeasStore.getState().upsertIdea(makeIdea())

    expect(useIdeasStore.getState().cacheOutbox).toEqual([])
    expect(useIdeasStore.getState().ideas).toHaveLength(1)
  })

  it("queues an upsert per write once hydrated", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [],
      unsyncedIds: [],
    })

    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))
    useIdeasStore.getState().upsertIdeas([
      makeIdea({ id: "b" }),
      makeIdea({ id: "c" }),
    ])

    const messages = useIdeasStore.getState().cacheOutbox.map((e) => e.message)
    expect(messages).toEqual([
      { type: "upsert", userId: "user-1", ideas: [makeIdea({ id: "a" })] },
      {
        type: "upsert",
        userId: "user-1",
        ideas: [makeIdea({ id: "b" }), makeIdea({ id: "c" })],
      },
    ])
  })

  it("marks local writes as local so Dexie can tell them apart", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [],
      unsyncedIds: [],
    })

    useIdeasStore.getState().addPendingIdea(makeIdea({ id: "local" }))

    const state = useIdeasStore.getState()
    expect(state.pendingIds).toEqual(new Set(["local"]))
    expect(state.cacheOutbox[0].message).toEqual({
      type: "upsert",
      userId: "user-1",
      ideas: [makeIdea({ id: "local" })],
      local: true,
    })
  })

  it("replaces the local row with the server row on sync", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [],
      unsyncedIds: [],
    })
    useIdeasStore.getState().addPendingIdea(makeIdea({ id: "local" }))

    const serverIdea = makeIdea({ id: "server", content: "First idea" })
    useIdeasStore.getState().markPendingSynced("local", serverIdea)

    const state = useIdeasStore.getState()
    expect(state.ideas.map((i) => i.id)).toEqual(["server"])
    expect(state.pendingIds.size).toBe(0)
    expect(state.cacheOutbox[1].message).toEqual({
      type: "replace",
      userId: "user-1",
      localId: "local",
      idea: serverIdea,
    })
  })

  it("queues a remove when an idea leaves the store", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [makeIdea({ id: "gone" })],
      unsyncedIds: [],
    })

    useIdeasStore.getState().removeIdea("gone")

    expect(useIdeasStore.getState().cacheOutbox[0].message).toEqual({
      type: "remove",
      userId: "user-1",
      ideaId: "gone",
    })
  })

  it("acks only the messages the controller has written", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [],
      unsyncedIds: [],
    })
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "a" }))
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "b" }))
    useIdeasStore.getState().upsertIdea(makeIdea({ id: "c" }))

    const firstSeq = useIdeasStore.getState().cacheOutbox[0].seq
    useIdeasStore.getState().ackCacheMessages(firstSeq)

    expect(
      useIdeasStore.getState().cacheOutbox.map((e) => e.message),
    ).toHaveLength(2)
    expect(useIdeasStore.getState().cacheOutbox[0].seq).toBeGreaterThan(firstSeq)
  })

  it("queues a clear for the active user on reset", () => {
    useIdeasStore.getState().hydrate({
      userId: "user-1",
      ideas: [makeIdea()],
      unsyncedIds: [],
    })

    useIdeasStore.getState().reset()

    const state = useIdeasStore.getState()
    expect(state.activeUserId).toBeNull()
    expect(state.ideas).toEqual([])
    expect(state.cacheOutbox[0].message).toEqual({
      type: "clear",
      userId: "user-1",
    })
  })
})

describe("ideas-store selectors", () => {
  const ideas = [
    makeIdea({ id: "inbox-1", content: "Alpha", created_at: "2024-06-03T12:00:00Z" }),
    makeIdea({
      id: "inbox-2",
      content: "Beta",
      created_at: "2024-06-02T12:00:00Z",
      pinned: true,
    }),
    makeIdea({ id: "archived-1", status: "archived", content: "Gamma" }),
    makeIdea({ id: "local-1", content: "Alpha" }),
  ]

  it("filters by status and drops a local row that duplicates a synced one", () => {
    const result = selectIdeas({
      ideas,
      pendingIds: new Set(["local-1"]),
      status: "inbox",
    })

    expect(result.map((i) => i.id)).toEqual(["inbox-1", "inbox-2"])
  })

  it("keeps a pending idea that has no synced twin", () => {
    const result = selectIdeas({
      ideas,
      pendingIds: new Set(["local-1"]),
      status: "inbox",
      search: "alpha",
    })

    expect(result.map((i) => i.id)).toEqual(["inbox-1"])
  })

  it("selects pinned inbox ideas only", () => {
    const result = selectPinnedIdeas({
      ideas,
      pendingIds: new Set(),
    })

    expect(result.map((i) => i.id)).toEqual(["inbox-2"])
  })
})