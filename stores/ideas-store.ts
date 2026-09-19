import { create } from "zustand"
import type { Idea, IdeaStatus } from "@/types/idea"

export interface IdeasQueryState {
  size: number
  hasMore: boolean
}

/**
 * Messages the store sends to the IndexedDB controller. The store never touches
 * Dexie itself: every mutation appends one of these to `cacheOutbox`, the
 * controller (lib/outbox/ideas-cache-controller.ts) drains the queue, writes it
 * to Dexie, then acks the messages it wrote.
 */
export type IdeasCacheMessage =
  | { type: "upsert"; userId: string; ideas: Idea[]; local?: boolean }
  | { type: "replace"; userId: string; localId: string; idea: Idea }
  | { type: "remove"; userId: string; ideaId: string }
  | { type: "clear"; userId: string }

export interface QueuedCacheMessage {
  /** Monotonic id so the controller can ack exactly what it has written. */
  seq: number
  message: IdeasCacheMessage
}

export interface IdeasStore {
  /**
   * Canonical list of every idea the client knows about: server rows that have
   * been fetched plus local ideas that are still waiting in the outbox. All
   * cards render from this list — nothing reads SWR or Dexie directly.
   */
  ideas: Idea[]
  /** Ids of ideas that are not accepted by the server yet. */
  pendingIds: Set<string>
  /** Owner of everything currently in `ideas`; null before hydration. */
  activeUserId: string | null
  /** True once the IndexedDB cache has been merged into `ideas`. */
  hydrated: boolean
  isOnline: boolean
  /** Per-query pagination metadata, keyed by `${status}:${search}`. */
  queries: Record<string, IdeasQueryState>
  /** Query keys whose server response has been merged into the store. */
  loadedQueries: Set<string>
  /** Outbound messages waiting for the IndexedDB controller to persist them. */
  cacheOutbox: QueuedCacheMessage[]
  upsertIdea: (idea: Idea) => void
  upsertIdeas: (ideas: Idea[]) => void
  removeIdea: (id: string) => void
  addPendingIdea: (idea: Idea) => void
  markPendingSynced: (localId: string, serverIdea?: Idea) => void
  setIsOnline: (online: boolean) => void
  setQuerySize: (key: string, size: number | ((current: number) => number)) => void
  setQueryHasMore: (key: string, hasMore: boolean) => void
  markQueryLoaded: (key: string) => void
  /** Seed the store from the IndexedDB cache. Never emits a cache message. */
  hydrate: (params: {
    userId: string
    ideas: Idea[]
    unsyncedIds: string[]
  }) => void
  /** Drop every message up to and including `throughSeq` after a successful write. */
  ackCacheMessages: (throughSeq: number) => void
  reset: () => void
}

function sortIdeas(ideas: Idea[]): Idea[] {
  return ideas.toSorted(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

function toMap(ideas: Idea[]): Map<string, Idea> {
  return new Map(ideas.map((idea) => [idea.id, idea]))
}

function mergeIdeas(current: Idea[], incoming: Idea[]): Idea[] {
  const map = toMap(current)
  for (const idea of incoming) map.set(idea.id, idea)
  return sortIdeas([...map.values()])
}

let cacheSeq = 0

function queueMessages(
  state: IdeasStore,
  messages: IdeasCacheMessage[],
): Partial<IdeasStore> {
  if (messages.length === 0) return {}
  const queued = messages.map((message) => {
    cacheSeq += 1
    return { seq: cacheSeq, message }
  })
  return { cacheOutbox: [...state.cacheOutbox, ...queued] }
}

function forActiveUser(
  state: IdeasStore,
  build: (userId: string) => IdeasCacheMessage,
): IdeasCacheMessage[] {
  return state.activeUserId ? [build(state.activeUserId)] : []
}

export const useIdeasStore = create<IdeasStore>((set) => ({
  ideas: [],
  pendingIds: new Set(),
  activeUserId: null,
  hydrated: false,
  isOnline: true,
  queries: {},
  loadedQueries: new Set(),
  cacheOutbox: [],

  upsertIdea: (idea) => {
    set((state) => ({
      ideas: mergeIdeas(state.ideas, [idea]),
      ...queueMessages(
        state,
        forActiveUser(state, (userId) => ({
          type: "upsert",
          userId,
          ideas: [idea],
        })),
      ),
    }))
  },

  upsertIdeas: (ideas) => {
    if (ideas.length === 0) return
    set((state) => ({
      ideas: mergeIdeas(state.ideas, ideas),
      ...queueMessages(
        state,
        forActiveUser(state, (userId) => ({
          type: "upsert",
          userId,
          ideas,
        })),
      ),
    }))
  },

  removeIdea: (id) => {
    set((state) => {
      if (!state.ideas.some((idea) => idea.id === id)) return state
      const pendingIds = new Set(state.pendingIds)
      pendingIds.delete(id)
      return {
        ideas: state.ideas.filter((idea) => idea.id !== id),
        pendingIds,
        ...queueMessages(
          state,
          forActiveUser(state, (userId) => ({
            type: "remove",
            userId,
            ideaId: id,
          })),
        ),
      }
    })
  },

  addPendingIdea: (idea) => {
    set((state) => {
      const pendingIds = new Set(state.pendingIds)
      pendingIds.add(idea.id)
      return {
        ideas: mergeIdeas(state.ideas, [idea]),
        pendingIds,
        ...queueMessages(
          state,
          forActiveUser(state, (userId) => ({
            type: "upsert",
            userId,
            ideas: [idea],
            local: true,
          })),
        ),
      }
    })
  },

  markPendingSynced: (localId, serverIdea) => {
    set((state) => {
      const map = toMap(state.ideas)
      map.delete(localId)
      if (serverIdea) map.set(serverIdea.id, serverIdea)
      const pendingIds = new Set(state.pendingIds)
      pendingIds.delete(localId)
      return {
        ideas: sortIdeas([...map.values()]),
        pendingIds,
        ...queueMessages(
          state,
          serverIdea
            ? forActiveUser(state, (userId) => ({
                type: "replace",
                userId,
                localId,
                idea: serverIdea,
              }))
            : [],
        ),
      }
    })
  },

  setIsOnline: (isOnline) => set({ isOnline }),

  setQuerySize: (key, size) => {
    set((state) => {
      const current = state.queries[key] ?? { size: 1, hasMore: false }
      const nextSize = typeof size === "function" ? size(current.size) : size
      return {
        queries: { ...state.queries, [key]: { ...current, size: nextSize } },
      }
    })
  },

  setQueryHasMore: (key, hasMore) => {
    set((state) => {
      const current = state.queries[key] ?? { size: 1, hasMore: false }
      if (current.hasMore === hasMore) return state
      return {
        queries: { ...state.queries, [key]: { ...current, hasMore } },
      }
    })
  },

  markQueryLoaded: (key) => {
    set((state) => {
      if (state.loadedQueries.has(key)) return state
      const loadedQueries = new Set(state.loadedQueries)
      loadedQueries.add(key)
      return { loadedQueries }
    })
  },

  hydrate: ({ userId, ideas, unsyncedIds }) => {
    set((state) => {
      const sameUser = state.activeUserId === userId
      return {
        activeUserId: userId,
        hydrated: true,
        // A rehydrate for the same user merges so rows fetched by SWR in the
        // meantime are not dropped; a different user replaces the list.
        ideas: sameUser ? mergeIdeas(state.ideas, ideas) : sortIdeas(ideas),
        pendingIds: new Set(unsyncedIds),
      }
    })
  },

  ackCacheMessages: (throughSeq) => {
    set((state) => {
      const cacheOutbox = state.cacheOutbox.filter(
        (entry) => entry.seq > throughSeq,
      )
      if (cacheOutbox.length === state.cacheOutbox.length) return state
      return { cacheOutbox }
    })
  },

  reset: () => {
    set((state) => ({
      ideas: [],
      pendingIds: new Set(),
      activeUserId: null,
      hydrated: false,
      queries: {},
      loadedQueries: new Set(),
      ...queueMessages(
        state,
        forActiveUser(state, (userId) => ({ type: "clear", userId })),
      ),
    }))
  },
}))

useIdeasStore.subscribe((state, prevState) => {
  const changed: Record<string, { from: unknown; to: unknown }> = {}
  for (const key of Object.keys(state) as (keyof IdeasStore)[]) {
    if (state[key] !== prevState[key]) {
      changed[key] = { from: prevState[key], to: state[key] }
    }
  }
  console.log("[IdeasStore] modified", changed)
})

export function ideasQueryKey(status: IdeaStatus, search?: string): string {
  return `${status}:${search?.trim() ?? ""}`
}

/**
 * Selects the ideas a given list should render. The store holds every status,
 * so each list filters its own slice and drops the transient duplicate that
 * exists while a local idea and its server copy briefly coexist.
 */
export function selectIdeas({
  ideas,
  pendingIds,
  status,
  search,
}: {
  ideas: Idea[]
  pendingIds: Set<string>
  status: IdeaStatus
  search?: string
}): Idea[] {
  const needle = search?.trim().toLowerCase() ?? ""
  const syncedContents = new Set(
    ideas.filter((idea) => !pendingIds.has(idea.id)).map((idea) => idea.content),
  )

  const result: Idea[] = []
  for (const idea of ideas) {
    if (idea.status !== status) continue
    if (pendingIds.has(idea.id) && syncedContents.has(idea.content)) continue
    if (needle && !idea.content.toLowerCase().includes(needle)) continue
    result.push(idea)
  }
  return result
}

export function selectPinnedIdeas({
  ideas,
  pendingIds,
}: {
  ideas: Idea[]
  pendingIds: Set<string>
}): Idea[] {
  return ideas.filter(
    (idea) => idea.pinned && idea.status === "inbox" && !pendingIds.has(idea.id),
  )
}