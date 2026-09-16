"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { Effect } from "effect"
import { fetcher } from "@/lib/api-client"
import { normalizeIdea } from "@/lib/ideas"
import { SaveIdeaLocally, GetPendingItems, MarkSynced } from "@/lib/outbox/idea-repository"
import { OfflineIdentity } from "@/lib/outbox/offline-identity"
import { SyncService } from "@/lib/outbox/sync"
import { AppLayer } from "@/lib/effect-runtime"
import { useOfflineIdeasStore } from "@/stores/offline-ideas-store"
import { useEffectRunEffectUnchecked } from "@/hooks/use-effect"
import type { IdeaStatus, Idea } from "@/types/idea"

interface UseIdeasOptions {
  status: IdeaStatus
  search?: string
  enabled?: boolean
}

export function useIdeas({ status, search, enabled = true }: UseIdeasOptions) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [size, setSize] = useState(1)
  const { localIdeas, setLocalIdeas, addLocalIdea, removeLocalIdea, setIsOnline } =
    useOfflineIdeasStore()

  useEffectRunEffectUnchecked(
    () =>
      Effect.gen(function* () {
        const identity = yield* OfflineIdentity
        const sync = yield* SyncService

        const online = yield* identity.isOnline()
        setIsOnline(online)

        yield* Effect.try({
          try: () => {
            window.addEventListener("online", () => setIsOnline(true))
            window.addEventListener("offline", () => setIsOnline(false))
          },
          catch: () => {},
        })

        yield* sync.initSync()
      }),
    [setIsOnline],
  )

  useEffectRunEffectUnchecked(
    () =>
      Effect.gen(function* () {
        if (!userId) return

        const identity = yield* OfflineIdentity

        yield* identity.setCachedUserId(userId)

        const pending = yield* GetPendingItems.execute()
        const unsynced = pending.map((item) => ({
          id: item.id,
          content: item.content,
          source: "web" as Idea["source"],
          status: "inbox" as IdeaStatus,
          tags: null,
          pinned: false,
          background_color: null,
          created_at: item.createdAt,
          updated_at: item.createdAt,
          deleted_at: null,
        }))
        setLocalIdeas(unsynced)
      }),
    [userId, setLocalIdeas],
  )

  useEffect(() => {
    if (!userId) return

    const handleFocus = () => {
      Effect.runPromise(
        Effect.gen(function* () {
          const pending = yield* GetPendingItems.execute()
          const unsynced = pending.map((item) => ({
            id: item.id,
            content: item.content,
            source: "web" as Idea["source"],
            status: "inbox" as IdeaStatus,
            tags: null,
            pinned: false,
            background_color: null,
            created_at: item.createdAt,
            updated_at: item.createdAt,
            deleted_at: null,
          }))
          setLocalIdeas(unsynced)
        }).pipe(Effect.catch(() => Effect.void)),
      )
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [userId, setLocalIdeas])

  const params = new URLSearchParams()
  if (userId) params.set("status", status)
  if (search) params.set("search", search)
  params.set("limit", String(size * 50))

  const swrKey =
    enabled && userId ? `/api/ideas?${params.toString()}` : null

  const isOnline = useOfflineIdeasStore((s) => s.isOnline)

  const { data, error, isLoading, isValidating } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: isOnline,
    revalidateOnReconnect: isOnline,
    onErrorRetry: (_err, _key, _config, revalidate, { retryCount }) => {
      if (!navigator.onLine) return
      if (retryCount >= 3) return
      setTimeout(() => revalidate({ retryCount }), 5000)
    },
  })

  const serverIdeas: Idea[] = (data?.ideas ?? []).map(normalizeIdea)
  const hasMore = (data?.ideas?.length ?? 0) > size * 50
  const isLoadingMore = isValidating && size > 1

  const serverIds = new Set(serverIdeas.map((i) => i.id))
  const serverContent = new Set(serverIdeas.map((i) => i.content))
  const mergedIdeas = [
    ...localIdeas.filter((i) => !serverIds.has(i.id) && !serverContent.has(i.content)),
    ...serverIdeas,
  ].toSorted(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const create = useCallback(
    async (content: string): Promise<{ ok: boolean }> => {
      return Effect.runPromise(
        Effect.provide(
          Effect.gen(function* () {
            const identity = yield* OfflineIdentity

            const resolvedUserId = userId || (yield* identity.resolveUserId())
            if (!resolvedUserId) return { ok: false }

            const localIdea = yield* SaveIdeaLocally.execute(content, resolvedUserId)

            addLocalIdea(localIdea as unknown as Idea)

            if (isOnline && swrKey) {
              try {
                const res = yield* Effect.tryPromise({
                  try: () =>
                    fetch("/api/ideas", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: localIdea.content }),
                    }),
                  catch: () => new Error("Network error"),
                })

                if (res.ok) {
                  yield* MarkSynced.execute(localIdea.id)
                  removeLocalIdea(localIdea.id)
                  mutate(swrKey)
                }
              } catch {
                // Will retry on next online event
              }
            }

            return { ok: true }
          }).pipe(Effect.catch(() => Effect.succeed({ ok: false }))),
          AppLayer,
        ),
      )
    },
    [userId, isOnline, swrKey, addLocalIdea, removeLocalIdea],
  )

  const updateStatus = useCallback(
    async (id: string, newStatus: IdeaStatus): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      const wasPinned = mergedIdeas.find((i) => i.id === id)?.pinned ?? false

      mutate(
        swrKey,
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          if (newStatus !== status) {
            return { ...current, ideas: current.ideas.filter((i) => i.id !== id) }
          }
          return {
            ...current,
            ideas: current.ideas.map((i) =>
              i.id === id ? { ...i, status: newStatus } : i,
            ),
          }
        },
        { revalidate: false },
      )

      if (wasPinned && newStatus !== "inbox") {
        mutate(
          "/api/ideas?pinned=true",
          (current: { ideas: Idea[] } | undefined) => {
            if (!current) return current
            return { ...current, ideas: current.ideas.filter((i) => i.id !== id) }
          },
          { revalidate: false },
        )
      }

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) {
          mutate(swrKey)
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to update status:", err)
        mutate(swrKey)
        return { ok: false }
      }
    },
    [swrKey, mergedIdeas, status],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      mutate(
        swrKey,
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          return {
            ...current,
            ideas: current.ideas.map((i) =>
              i.id === id ? { ...i, pinned } : i,
            ),
          }
        },
        { revalidate: false },
      )

      mutate(
        "/api/ideas?pinned=true",
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          if (pinned) {
            const idea = mergedIdeas.find((i) => i.id === id)
            if (idea) {
              return { ...current, ideas: [{ ...idea, pinned }, ...current.ideas] }
            }
            return current
          }
          return { ...current, ideas: current.ideas.filter((i) => i.id !== id) }
        },
        { revalidate: false },
      )

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned }),
        })
        if (!res.ok) {
          mutate(swrKey)
          mutate("/api/ideas?pinned=true")
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to update pin:", err)
        mutate(swrKey)
        mutate("/api/ideas?pinned=true")
        return { ok: false }
      }
    },
    [swrKey, mergedIdeas],
  )

  const updateColor = useCallback(
    async (id: string, background_color: string | null): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      mutate(
        swrKey,
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          return {
            ...current,
            ideas: current.ideas.map((i) =>
              i.id === id ? { ...i, background_color } : i,
            ),
          }
        },
        { revalidate: false },
      )

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ background_color }),
        })
        if (!res.ok) {
          mutate(swrKey)
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to update color:", err)
        mutate(swrKey)
        return { ok: false }
      }
    },
    [swrKey],
  )

  const updateContent = useCallback(
    async (id: string, content: string): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      mutate(
        swrKey,
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          return {
            ...current,
            ideas: current.ideas.map((i) =>
              i.id === id ? { ...i, content } : i,
            ),
          }
        },
        { revalidate: false },
      )

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        if (!res.ok) {
          mutate(swrKey)
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to update content:", err)
        mutate(swrKey)
        return { ok: false }
      }
    },
    [swrKey],
  )

  const permanentDelete = useCallback(
    async (id: string): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      mutate(
        swrKey,
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          return { ...current, ideas: current.ideas.filter((i) => i.id !== id) }
        },
        { revalidate: false },
      )

      try {
        const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" })
        if (!res.ok) {
          mutate(swrKey)
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to delete idea:", err)
        mutate(swrKey)
        return { ok: false }
      }
    },
    [swrKey],
  )

  return {
    ideas: mergedIdeas,
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
