"use client"

import { useCallback, useEffect, useRef } from "react"
import useSWRInfinite from "swr/infinite"
import { fetcher, ideasApi } from "@/lib/api-client"
import { revalidateAllIdeas } from "@/lib/swr-helpers"
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

  const mutateThenRevalidate = useCallback(
    async (apiCall: () => Promise<Response>) => {
      const res = await apiCall()
      if (res.ok) {
        mutateRef.current()
        revalidateAllIdeas()
      }
      return { ok: res.ok }
    },
    [],
  )

  const create = useCallback(async (content: string) => {
    const res = await ideasApi.create(content)
    if (!res.ok) return { ok: false }
    mutateRef.current()
    revalidateAllIdeas()
    return { ok: true }
  }, [])

  const updateStatus = useCallback(
    (id: string, newStatus: IdeaStatus) =>
      mutateThenRevalidate(() => ideasApi.update(id, { status: newStatus })),
    [mutateThenRevalidate],
  )

  const updatePin = useCallback(
    (id: string, pinned: boolean) =>
      mutateThenRevalidate(() => ideasApi.update(id, { pinned })),
    [mutateThenRevalidate],
  )

  const updateColor = useCallback(
    (id: string, background_color: string | null) =>
      mutateThenRevalidate(() =>
        ideasApi.update(id, { background_color }),
      ),
    [mutateThenRevalidate],
  )

  const permanentDelete = useCallback(
    (id: string) =>
      mutateThenRevalidate(() => ideasApi.remove(id)),
    [mutateThenRevalidate],
  )

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
