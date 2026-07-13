"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { fetcher, ideasApi } from "@/lib/api-client"
import { revalidateAllIdeas } from "@/lib/swr-helpers"
import type { Idea, IdeaStatus } from "@/types/idea"

interface UseIdeasOptions {
  status: IdeaStatus
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

  async function mutateWithOptimistic(
    updateFn: (current: { ideas: Idea[] }) => { ideas: Idea[] },
    apiCall: () => Promise<Response>,
  ): Promise<{ ok: boolean }> {
    await mutate((current) => {
      if (!current) return current
      return updateFn(current)
    }, false)
    const res = await apiCall()
    if (res.ok) revalidateAllIdeas()
    return { ok: res.ok }
  }

  const create = useCallback(async (content: string) => {
    const res = await ideasApi.create(content)
    if (!res.ok) return { ok: false }
    revalidateAllIdeas()
    return { ok: true }
  }, [])

  const updateStatus = useCallback(
    async (id: string, newStatus: IdeaStatus) =>
      mutateWithOptimistic(
        (current) => ({
          ideas: current.ideas.filter((idea) => idea.id !== id),
        }),
        () => ideasApi.update(id, { status: newStatus }),
      ),
    [mutate],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean) =>
      mutateWithOptimistic(
        (current) => ({
          ideas: current.ideas.map((idea) =>
            idea.id === id ? { ...idea, pinned } : idea,
          ),
        }),
        () => ideasApi.update(id, { pinned }),
      ),
    [mutate],
  )

  const updateColor = useCallback(
    async (id: string, background_color: string | null) =>
      mutateWithOptimistic(
        (current) => ({
          ideas: current.ideas.map((idea) =>
            idea.id === id ? { ...idea, background_color } : idea,
          ),
        }),
        () => ideasApi.update(id, { background_color }),
      ),
    [mutate],
  )

  const updateContent = useCallback(
    async (id: string, content: string) =>
      mutateWithOptimistic(
        (current) => ({
          ideas: current.ideas.map((idea) =>
            idea.id === id ? { ...idea, content } : idea,
          ),
        }),
        () => ideasApi.update(id, { content }),
      ),
    [mutate],
  )

  const permanentDelete = useCallback(
    async (id: string) =>
      mutateWithOptimistic(
        (current) => ({
          ideas: current.ideas.filter((idea) => idea.id !== id),
        }),
        () => ideasApi.remove(id),
      ),
    [mutate],
  )

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
