"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { fetcher, ideasApi } from "@/lib/api-client"
import type { Idea } from "@/types/idea"

interface UseIdeasOptions {
  status: "inbox" | "archived" | "deleted"
  enabled?: boolean
}

export function useIdeas({ status, enabled = true }: UseIdeasOptions) {
  const { data, error, isLoading, mutate } = useSWR<{ ideas: Idea[] }>(
    enabled ? `/api/ideas?status=${status}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const create = useCallback(async (content: string) => {
    const response = await ideasApi.create(content)
    if (response.ok) mutate()
  }, [mutate])

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
    permanentDelete,
  }
}
