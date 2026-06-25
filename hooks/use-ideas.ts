"use client"

import { useCallback } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { fetcher, ideasApi } from "@/lib/api-client"
import type { Idea } from "@/types/idea"

interface UseIdeasOptions {
  status: "inbox" | "archived" | "deleted"
  search?: string
  enabled?: boolean
}

export function useIdeas({ status, search, enabled = true }: UseIdeasOptions) {
  const params = new URLSearchParams({ status })
  if (search) params.set("search", search)

  const { data, error, isLoading, mutate } = useSWR<{ ideas: Idea[] }>(
    enabled ? `/api/ideas?${params.toString()}` : null,
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      focusThrottleInterval: 10_000,
    }
  )

  const create = useCallback(async (content: string) => {
    const response = await ideasApi.create(content)
    if (response.ok) {
      globalMutate(
        (key) => typeof key === "string" && key.startsWith("/api/ideas")
      )
    }
  }, [])

  const updateStatus = useCallback(
    async (id: string, newStatus: "inbox" | "archived" | "deleted") => {
      await mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ideas: currentData.ideas.filter((idea) => idea.id !== id),
          }
        },
        false
      )

      await ideasApi.update(id, { status: newStatus })
      mutate()
    },
    [mutate]
  )

  const updatePin = useCallback(async (id: string, pinned: boolean) => {
    await mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.map((idea) =>
            idea.id === id ? { ...idea, pinned } : idea
          ),
        }
      },
      false
    )

    await ideasApi.update(id, { pinned })
    mutate()
    globalMutate("/api/ideas?pinned=true")
  }, [mutate])

  const updateColor = useCallback(
    async (id: string, background_color: string | null) => {
      await mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ideas: currentData.ideas.map((idea) =>
              idea.id === id ? { ...idea, background_color } : idea
            ),
          }
        },
        false
      )

      await ideasApi.update(id, { background_color })
      mutate()
    },
    [mutate]
  )

  const updateContent = useCallback(async (id: string, content: string) => {
    await mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.map((idea) =>
            idea.id === id ? { ...idea, content } : idea
          ),
        }
      },
      false
    )

    await ideasApi.update(id, { content })
    mutate()
  }, [mutate])

  const permanentDelete = useCallback(async (id: string) => {
    await mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.filter((idea) => idea.id !== id),
        }
      },
      false
    )

    await ideasApi.remove(id)
    mutate()
  }, [mutate])

  return {
    ideas: data?.ideas ?? [],
    error,
    isLoading,
    create,
    updateStatus,
    updatePin,
    updateColor,
    updateContent,
    permanentDelete,
  }
}
