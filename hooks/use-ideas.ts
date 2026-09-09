"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { saveIdeaLocally, getPendingItems, markSynced } from "@/lib/outbox/idea-repository"
import { resolveUserId, setCachedUserId } from "@/lib/offline-identity"
import { initSync } from "@/lib/outbox/sync"
import { useOfflineIdeasStore } from "@/stores/offline-ideas-store"
import type { IdeaStatus, Idea } from "@/types/idea"

interface UseIdeasOptions {
  status: IdeaStatus
  search?: string
  enabled?: boolean
}

function normalizeIdea(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    content: row.content as string,
    source: row.source as Idea["source"],
    status: row.status as IdeaStatus,
    tags: row.tags ? JSON.parse(row.tags as string) : null,
    pinned: Boolean(row.pinned),
    background_color: row.background_color as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    deleted_at: row.deleted_at as string | null,
  }
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch")
    return r.json()
  })

export function useIdeas({ status, search, enabled = true }: UseIdeasOptions) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [size, setSize] = useState(1)
  const { localIdeas, setLocalIdeas, addLocalIdea, removeLocalIdea, setIsOnline } =
    useOfflineIdeasStore()

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    initSync()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setIsOnline])

  useEffect(() => {
    if (!userId) return

    setCachedUserId(userId)

    const loadLocalIdeas = async () => {
      const pending = await getPendingItems()
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
    }

    loadLocalIdeas()

    const handleFocus = () => loadLocalIdeas()
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
    }
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
      const resolvedUserId = userId || (await resolveUserId())
      if (!resolvedUserId) return { ok: false }

      const localIdea = await saveIdeaLocally(content, resolvedUserId)

      addLocalIdea(localIdea as unknown as Idea)

      if (isOnline && swrKey) {
        try {
          const res = await fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: localIdea.content }),
          })

          if (res.ok) {
            await markSynced(localIdea.id)
            removeLocalIdea(localIdea.id)
            mutate(swrKey)
          }
        } catch {
          // Will retry on next online event
        }
      }

      return { ok: true }
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
