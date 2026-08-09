"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@powersync/react"
import { getCachedUserId } from "@/lib/offline-identity"
import { useHydrated } from "@/hooks/use-hydrated"
import { ideaRowToIdea } from "@/lib/powersync/mappers"

export function usePinnedIdeas() {
  const hydrated = useHydrated()
  const { data: session } = useSession()
  const userId = session?.user?.id ?? getCachedUserId()

  const { data, isLoading, error } = useQuery(
    userId
      ? "SELECT * FROM ideas WHERE user_id = ? AND pinned = 1 AND status = 'inbox' ORDER BY created_at DESC, id DESC"
      : "SELECT * FROM ideas WHERE 1=0",
    userId ? [userId] : [],
  )

  return {
    ideas: (data ?? []).map(ideaRowToIdea),
    error,
    isLoading: hydrated ? isLoading : false,
  }
}
