"use client"

import { useCallback, useEffect, useMemo } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { Effect } from "effect"
import { fetcher } from "@/lib/api-client"
import { normalizeIdea } from "@/lib/ideas"
import { SaveIdeaLocally } from "@/lib/outbox/idea-repository"
import { OfflineIdentity } from "@/lib/outbox/offline-identity"
import { SyncService } from "@/lib/outbox/sync"
import {
  IdeasCacheController,
  hydrateIdeasCache,
} from "@/lib/outbox/ideas-cache-controller"
import { AppLayer } from "@/lib/effect-runtime"
import {
  useIdeasStore,
  selectIdeas,
  ideasQueryKey,
  type IdeasQueryState,
} from "@/stores/ideas-store"
import { useEffectRunEffectUnchecked } from "@/hooks/use-effect"
import type { IdeaStatus, Idea } from "@/types/idea"

interface UseIdeasOptions {
  status: IdeaStatus
  search?: string
  enabled?: boolean
}

const PAGE_SIZE = 50

export function useIdeas({ status, search, enabled = true }: UseIdeasOptions) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const queryKey = ideasQueryKey(status, search)
  const query = useIdeasStore((s): IdeasQueryState | undefined => s.queries[queryKey])
  const size = query?.size ?? 1
  const hasMore = query?.hasMore ?? false
  const queryLoaded = useIdeasStore((s) => s.loadedQueries.has(queryKey))

  const storeIdeas = useIdeasStore((s) => s.ideas)
  const pendingIds = useIdeasStore((s) => s.pendingIds)
  const isOnline = useIdeasStore((s) => s.isOnline)

  const addPendingIdea = useIdeasStore((s) => s.addPendingIdea)
  const setIsOnline = useIdeasStore((s) => s.setIsOnline)
  const upsertIdeas = useIdeasStore((s) => s.upsertIdeas)
  const setQueryHasMore = useIdeasStore((s) => s.setQueryHasMore)
  const markQueryLoaded = useIdeasStore((s) => s.markQueryLoaded)

  useEffectRunEffectUnchecked(
    () =>
      Effect.gen(function* () {
        const identity = yield* OfflineIdentity
        const sync = yield* SyncService
        const cache = yield* IdeasCacheController

        const online = yield* identity.isOnline()
        setIsOnline(online)

        yield* Effect.try({
          try: () => {
            window.addEventListener("online", () => setIsOnline(true))
            window.addEventListener("offline", () => setIsOnline(false))
          },
          catch: () => {},
        })

        yield* cache.start()
        yield* sync.initSync()
      }),
    [setIsOnline],
  )

  useEffectRunEffectUnchecked(
    () =>
      Effect.gen(function* () {
        if (!userId) return

        const identity = yield* OfflineIdentity
        const cache = yield* IdeasCacheController

        yield* identity.setCachedUserId(userId)

        // The store's initial state comes from IndexedDB: cached ideas plus
        // whatever the outbox still owes the server.
        yield* cache.hydrate(userId)
      }),
    [userId],
  )

  useEffect(() => {
    if (!userId) return

    const handleFocus = () => {
      hydrateIdeasCache(userId).catch(() => {})
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [userId])

  const params = new URLSearchParams()
  if (userId) params.set("status", status)
  if (search) params.set("search", search)
  params.set("limit", String(size * PAGE_SIZE))

  const swrKey = enabled && userId ? `/api/ideas?${params.toString()}` : null

  const { data, error, isLoading: isFetching, isValidating } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: isOnline,
    revalidateOnReconnect: isOnline,
    onErrorRetry: (_err, _key, _config, revalidate, { retryCount }) => {
      if (!navigator.onLine) return
      if (retryCount >= 3) return
      setTimeout(() => revalidate({ retryCount }), 5000)
    },
  })

  const serverIdeas = useMemo(
    () => ((data?.ideas ?? []) as Record<string, unknown>[]).map(normalizeIdea),
    [data],
  )

  // The fetch layer is transport only: its results are pushed into the store,
  // which is what the rendered cards read from.
  useEffect(() => {
    if (!data) return
    upsertIdeas(serverIdeas)
    setQueryHasMore(queryKey, (data?.ideas?.length ?? 0) > size * PAGE_SIZE)
    markQueryLoaded(queryKey)
  }, [
    data,
    serverIdeas,
    upsertIdeas,
    setQueryHasMore,
    markQueryLoaded,
    queryKey,
    size,
  ])

  // Keep showing the skeleton until the response has actually reached the
  // store, otherwise the list flashes its empty state for one paint.
  const ideas = useMemo(
    () => selectIdeas({ ideas: storeIdeas, pendingIds, status, search }),
    [storeIdeas, pendingIds, status, search],
  )

  // Ideas hydrated from IndexedDB are real content: render them while SWR
  // revalidates instead of hiding them behind the skeleton. With nothing
  // cached, the skeleton still waits for the response so the empty state
  // cannot flash for one paint.
  const isLoading =
    ideas.length === 0 && (isFetching || data != null) && !queryLoaded

  const isLoadingMore = isValidating && size > 1

  const setSize = useCallback(
    (next: number | ((current: number) => number)) => {
      useIdeasStore.getState().setQuerySize(queryKey, next)
    },
    [queryKey],
  )

  const create = useCallback(
    async (content: string): Promise<{ ok: boolean }> => {
      return Effect.runPromise(
        Effect.provide(
          Effect.gen(function* () {
            const identity = yield* OfflineIdentity
            const cache = yield* IdeasCacheController

            const resolvedUserId = userId || (yield* identity.resolveUserId())
            if (!resolvedUserId) return { ok: false }

            // 1. durable intent in the outbox
            const localIdea = yield* SaveIdeaLocally.execute(
              content,
              resolvedUserId,
            )

            // 2. store write + message for the IndexedDB controller
            addPendingIdea(localIdea)

            // 3. local commit to disk; the controller then hands the outbox to
            //    the sync service, which pushes it to the server (no-op while
            //    offline). No network code lives here.
            yield* cache.flush()

            return { ok: true }
          }).pipe(Effect.catch(() => Effect.succeed({ ok: false }))),
          AppLayer,
        ),
      )
    },
    [userId, addPendingIdea],
  )

  const updateStatus = useCallback(
    async (id: string, newStatus: IdeaStatus): Promise<{ ok: boolean }> => {
      const store = useIdeasStore.getState()
      const previous = store.ideas.find((i) => i.id === id)
      if (!previous) return { ok: false }

      const optimistic: Idea = { ...previous, status: newStatus }
      if (newStatus === "deleted" && !previous.deleted_at) {
        optimistic.deleted_at = new Date().toISOString()
      } else if (
        (newStatus === "inbox" || newStatus === "archived") &&
        previous.status === "deleted"
      ) {
        optimistic.deleted_at = null
      }
      store.upsertIdea(optimistic)

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) {
          store.upsertIdea(previous)
          return { ok: false }
        }
        const payload = await res.json().catch(() => null)
        if (payload?.idea) store.upsertIdea(normalizeIdea(payload.idea))
        return { ok: true }
      } catch (err) {
        console.error("Failed to update status:", err)
        store.upsertIdea(previous)
        return { ok: false }
      }
    },
    [],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean): Promise<{ ok: boolean }> => {
      const store = useIdeasStore.getState()
      const previous = store.ideas.find((i) => i.id === id)
      if (!previous) return { ok: false }

      store.upsertIdea({ ...previous, pinned })

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned }),
        })
        if (!res.ok) {
          store.upsertIdea(previous)
          return { ok: false }
        }
        const payload = await res.json().catch(() => null)
        if (payload?.idea) store.upsertIdea(normalizeIdea(payload.idea))
        return { ok: true }
      } catch (err) {
        console.error("Failed to update pin:", err)
        store.upsertIdea(previous)
        return { ok: false }
      }
    },
    [],
  )

  const updateColor = useCallback(
    async (id: string, background_color: string | null): Promise<{ ok: boolean }> => {
      const store = useIdeasStore.getState()
      const previous = store.ideas.find((i) => i.id === id)
      if (!previous) return { ok: false }

      store.upsertIdea({ ...previous, background_color })

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ background_color }),
        })
        if (!res.ok) {
          store.upsertIdea(previous)
          return { ok: false }
        }
        const payload = await res.json().catch(() => null)
        if (payload?.idea) store.upsertIdea(normalizeIdea(payload.idea))
        return { ok: true }
      } catch (err) {
        console.error("Failed to update color:", err)
        store.upsertIdea(previous)
        return { ok: false }
      }
    },
    [],
  )

  const updateContent = useCallback(
    async (id: string, content: string): Promise<{ ok: boolean }> => {
      const store = useIdeasStore.getState()
      const previous = store.ideas.find((i) => i.id === id)
      if (!previous) return { ok: false }

      store.upsertIdea({ ...previous, content })

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        if (!res.ok) {
          store.upsertIdea(previous)
          return { ok: false }
        }
        const payload = await res.json().catch(() => null)
        if (payload?.idea) store.upsertIdea(normalizeIdea(payload.idea))
        return { ok: true }
      } catch (err) {
        console.error("Failed to update content:", err)
        store.upsertIdea(previous)
        return { ok: false }
      }
    },
    [],
  )

  const permanentDelete = useCallback(
    async (id: string): Promise<{ ok: boolean }> => {
      const store = useIdeasStore.getState()
      const previous = store.ideas.find((i) => i.id === id)
      if (!previous) return { ok: false }

      store.removeIdea(id)

      try {
        const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" })
        if (!res.ok) {
          store.upsertIdea(previous)
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to delete idea:", err)
        store.upsertIdea(previous)
        return { ok: false }
      }
    },
    [],
  )

  return {
    ideas,
    error: isOnline ? error : null,
    isLoading,
    isLoadingMore,
    hasMore,
    size,
    setSize,
    isOnline,
    create,
    updateStatus,
    updatePin,
    updateColor,
    updateContent,
    permanentDelete,
  }
}