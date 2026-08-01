"use client"

import { useCallback, useEffect, useRef } from "react"
import useSWRInfinite from "swr/infinite"
import { fetcher, ideasApi } from "@/lib/api-client"
import { createIdea } from "@/lib/create-idea"
import { applyIdeaUpdate, removeIdeaFromCache, revalidateAllIdeas } from "@/lib/swr-helpers"
import type { Idea, IdeaStatus } from "@/types/idea"

interface IdeasResponse {
  ideas: Idea[]
  nextCursor: string | null
}

interface UseIdeasOptions {
  status: IdeaStatus
  search?: string
  enabled?: boolean
}

const PAGE_SIZE = 50

export function useIdeas({ status, search, enabled = true }: UseIdeasOptions) {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: IdeasResponse | null) => {
      if (!enabled) return null
      if (pageIndex > 0 && !previousPageData?.nextCursor) return null

      const params = new URLSearchParams({ status })
      if (search) params.set("search", search)
      if (pageIndex > 0 && previousPageData?.nextCursor) {
        params.set("cursor", previousPageData.nextCursor)
      }
      params.set("limit", String(PAGE_SIZE))
      return `/api/ideas?${params.toString()}`
    },
    [status, search, enabled],
  )

  const { data, error, isLoading, isValidating, size, setSize, mutate: boundMutate } =
    useSWRInfinite<IdeasResponse>(getKey, fetcher, {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      focusThrottleInterval: 10_000,
    })

  const mutateRef = useRef(boundMutate)
  useEffect(() => { mutateRef.current = boundMutate }, [boundMutate])

  const ideas = data?.flatMap((page) => page.ideas) ?? []
  const hasMore = data ? data[data.length - 1]?.nextCursor != null : false
  const isLoadingMore = size > 0 && isValidating && hasMore

  const create = useCallback(async (content: string) => {
    const result = await createIdea(content)
    mutateRef.current()
    return { ok: result.ok }
  }, [])

  const updateStatus = useCallback(async (id: string, newStatus: IdeaStatus) => {
    removeIdeaFromCache(id)

    const res = await ideasApi.update(id, { status: newStatus })

    mutateRef.current()
    revalidateAllIdeas()
    return { ok: res.ok }
  }, [])

  const updatePin = useCallback(async (id: string, pinned: boolean) => {
    applyIdeaUpdate(id, (idea) => ({ ...idea, pinned }))

    const res = await ideasApi.update(id, { pinned })

    // Intentionally no revalidateAllIdeas: the active-list refetch reconciles
    // the toggle; other views catch up on tab mount / focus / 30s interval.
    mutateRef.current()
    return { ok: res.ok }
  }, [])

  const updateColor = useCallback(async (id: string, background_color: string | null) => {
    applyIdeaUpdate(id, (idea) => ({ ...idea, background_color }))

    const res = await ideasApi.update(id, { background_color })

    // Intentionally no revalidateAllIdeas: the active-list refetch reconciles
    // the toggle; other views catch up on tab mount / focus / 30s interval.
    mutateRef.current()
    return { ok: res.ok }
  }, [])

  const permanentDelete = useCallback(async (id: string) => {
    removeIdeaFromCache(id)

    const res = await ideasApi.remove(id)

    mutateRef.current()
    revalidateAllIdeas()
    return { ok: res.ok }
  }, [])

  return {
    ideas,
    data,
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
    permanentDelete,
  }
}
