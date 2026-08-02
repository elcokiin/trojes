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

  // In-place field edits (pin, color, content) stay in the same list, so we
  // optimistically patch the cache and reconcile only the active list. No
  // revalidateAllIdeas: other views catch up on tab mount / focus / 30s interval.
  const updateIdeaField = useCallback(
    async (id: string, patch: Record<string, unknown>, updater: (idea: Idea) => Idea) => {
      applyIdeaUpdate(id, updater)
      const res = await ideasApi.update(id, patch)
      mutateRef.current()
      return { ok: res.ok }
    },
    [],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean) => {
      const result = await updateIdeaField(id, { pinned }, (idea) => ({ ...idea, pinned }))
      // Pinning affects the pinned tray (a separate SWR key), so reconcile it
      // immediately instead of waiting for tab mount / focus / the refresh
      // interval.
      revalidateAllIdeas()
      return result
    },
    [updateIdeaField],
  )

  const updateColor = useCallback(
    (id: string, background_color: string | null) =>
      updateIdeaField(id, { background_color }, (idea) => ({ ...idea, background_color })),
    [updateIdeaField],
  )

  const updateContent = useCallback(
    (id: string, content: string) => updateIdeaField(id, { content }, (idea) => ({ ...idea, content })),
    [updateIdeaField],
  )

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
    updateContent,
    permanentDelete,
  }
}
