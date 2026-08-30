"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import type { Idea } from "@/types/idea"

function normalizeIdea(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    content: row.content as string,
    source: row.source as Idea["source"],
    status: row.status as Idea["status"],
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
