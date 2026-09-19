"use client"

import { useEffect, useMemo } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { fetcher } from "@/lib/api-client"
import { normalizeIdea } from "@/lib/ideas"
import { useIdeasStore, selectPinnedIdeas } from "@/stores/ideas-store"
import type { Idea } from "@/types/idea"

export function usePinnedIdeas() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const swrKey = userId ? "/api/ideas?pinned=true" : null

  const { data, error, isLoading } = useSWR(swrKey, fetcher)

  const upsertIdeas = useIdeasStore((s) => s.upsertIdeas)
  const storeIdeas = useIdeasStore((s) => s.ideas)
  const pendingIds = useIdeasStore((s) => s.pendingIds)

  const serverIdeas: Idea[] = useMemo(
    () => ((data?.ideas ?? []) as Record<string, unknown>[]).map(normalizeIdea),
    [data],
  )

  useEffect(() => {
    if (serverIdeas.length > 0) upsertIdeas(serverIdeas)
  }, [serverIdeas, upsertIdeas])

  const ideas = useMemo(
    () => selectPinnedIdeas({ ideas: storeIdeas, pendingIds }),
    [storeIdeas, pendingIds],
  )

  return {
    ideas,
    error,
    isLoading,
  }
}