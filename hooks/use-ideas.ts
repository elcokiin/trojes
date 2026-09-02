"use client"

import { useCallback, startTransition, useState } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { optimisticCreateIdea } from "@/lib/create-idea"
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

  const params = new URLSearchParams()
  if (userId) params.set("status", status)
  if (search) params.set("search", search)
  params.set("limit", String(size * 50))

  const swrKey =
    enabled && userId ? `/api/ideas?${params.toString()}` : null

  const { data, error, isLoading, isValidating } = useSWR(swrKey, fetcher)

  const rawIdeas: Record<string, unknown>[] = data?.ideas ?? []
  const ideas = rawIdeas.map(normalizeIdea)
  const hasMore = (data?.ideas?.length ?? 0) > size * 50
  const isLoadingMore = isValidating && size > 1

  const create = useCallback(
    async (content: string): Promise<{ ok: boolean }> => {
      if (!userId) return { ok: false }
      const result = await optimisticCreateIdea(content)
      return { ok: result.ok }
    },
    [userId],
  )

  const updateStatus = useCallback(
    async (id: string, newStatus: IdeaStatus): Promise<{ ok: boolean }> => {
      let prevInbox: { ideas: Idea[] } | undefined
      let prevPinned: { ideas: Idea[] } | undefined
      const wasPinned = ideas.find((i) => i.id === id)?.pinned ?? false

      startTransition(() => {
        mutate(
          swrKey,
          (current: { ideas: Idea[] } | undefined) => {
            if (!current) return current
            prevInbox = current
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
              prevPinned = current
              return { ...current, ideas: current.ideas.filter((i) => i.id !== id) }
            },
            { revalidate: false },
          )
        }
      })

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) {
          if (prevInbox) mutate(swrKey, prevInbox, { revalidate: false })
          if (prevPinned) mutate("/api/ideas?pinned=true", prevPinned, { revalidate: false })
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to update status:", err)
        if (prevInbox) mutate(swrKey, prevInbox, { revalidate: false })
        if (prevPinned) mutate("/api/ideas?pinned=true", prevPinned, { revalidate: false })
        return { ok: false }
      }
    },
    [swrKey, ideas],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean): Promise<{ ok: boolean }> => {
      let prevInbox: { ideas: Idea[] } | undefined
      let prevPinned: { ideas: Idea[] } | undefined

      startTransition(() => {
        mutate(
          swrKey,
          (current: { ideas: Idea[] } | undefined) => {
            if (!current) return current
            prevInbox = current
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
            prevPinned = current
            if (pinned) {
              const idea = prevInbox?.ideas.find((i) => i.id === id)
              if (idea) {
                return { ...current, ideas: [{ ...idea, pinned }, ...current.ideas] }
              }
              return current
            }
            return { ...current, ideas: current.ideas.filter((i) => i.id !== id) }
          },
          { revalidate: false },
        )
      })

      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned }),
        })
        if (!res.ok) {
          if (prevInbox) mutate(swrKey, prevInbox, { revalidate: false })
          if (prevPinned) mutate("/api/ideas?pinned=true", prevPinned, { revalidate: false })
          return { ok: false }
        }
        return { ok: true }
      } catch (err) {
        console.error("Failed to update pin:", err)
        if (prevInbox) mutate(swrKey, prevInbox, { revalidate: false })
        if (prevPinned) mutate("/api/ideas?pinned=true", prevPinned, { revalidate: false })
        return { ok: false }
      }
    },
    [swrKey],
  )

  const updateColor = useCallback(
    async (id: string, background_color: string | null): Promise<{ ok: boolean }> => {
      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ background_color }),
        })
        if (!res.ok) return { ok: false }
        mutate(swrKey)
        return { ok: true }
      } catch (err) {
        console.error("Failed to update color:", err)
        return { ok: false }
      }
    },
    [swrKey],
  )

  const updateContent = useCallback(
    async (id: string, content: string): Promise<{ ok: boolean }> => {
      try {
        const res = await fetch(`/api/ideas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        if (!res.ok) return { ok: false }
        mutate(swrKey)
        return { ok: true }
      } catch (err) {
        console.error("Failed to update content:", err)
        return { ok: false }
      }
    },
    [swrKey],
  )

  const permanentDelete = useCallback(
    async (id: string): Promise<{ ok: boolean }> => {
      try {
        const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" })
        if (!res.ok) return { ok: false }
        mutate(swrKey)
        return { ok: true }
      } catch (err) {
        console.error("Failed to delete idea:", err)
        return { ok: false }
      }
    },
    [swrKey],
  )

  return {
    ideas,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    size,
    setSize,
    create,
    updateStatus,
    updatePin,
    updateColor,
    updateContent,
    permanentDelete,
  }
}
