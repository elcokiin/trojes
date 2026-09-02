"use client"

import { useCallback, useState } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { insertIdea } from "@/lib/create-idea"
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
      if (!userId || !swrKey) return { ok: false }
      const idea = await insertIdea(content)
      if (!idea) return { ok: false }

      mutate(
        swrKey,
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          return { ...current, ideas: [idea, ...current.ideas] }
        },
        { revalidate: false },
      )

      return { ok: true }
    },
    [userId, swrKey],
  )

  const updateStatus = useCallback(
    async (id: string, newStatus: IdeaStatus): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      const wasPinned = ideas.find((i) => i.id === id)?.pinned ?? false

      // Optimistically remove or update the idea in the current list
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

      // If the idea was pinned and is leaving inbox, remove from pinned list
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
    [swrKey, ideas, status],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean): Promise<{ ok: boolean }> => {
      if (!swrKey) return { ok: false }

      // Optimistically toggle pin in the current list
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

      // Update the pinned list
      mutate(
        "/api/ideas?pinned=true",
        (current: { ideas: Idea[] } | undefined) => {
          if (!current) return current
          if (pinned) {
            const idea = ideas.find((i) => i.id === id)
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
    [swrKey, ideas],
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
