"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import { fetcher } from "@/lib/api-client"
import { normalizeIdea } from "@/lib/ideas"
import type { Idea } from "@/types/idea"

export function usePinnedIdeas() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const swrKey = userId ? "/api/ideas?pinned=true" : null

  const { data, error, isLoading } = useSWR(swrKey, fetcher)

  const ideas: Idea[] = ((data?.ideas ?? []) as Record<string, unknown>[]).map(normalizeIdea)

  return {
    ideas,
    error,
    isLoading,
  }
}
