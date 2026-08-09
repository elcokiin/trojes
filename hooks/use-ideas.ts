"use client"

import { useCallback, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@powersync/react"
import { db } from "@/lib/powersync/db"
import { insertIdea } from "@/lib/create-idea"
import { getCachedUserId } from "@/lib/offline-identity"
import { useHydrated } from "@/hooks/use-hydrated"
import { ideaRowToIdea } from "@/lib/powersync/mappers"
import type { IdeaRow } from "@/lib/powersync/schema"
import type { IdeaStatus } from "@/types/idea"

interface UseIdeasOptions {
  status: IdeaStatus
  search?: string
  enabled?: boolean
}

const PAGE_SIZE = 50

export function useIdeas({ status, search, enabled = true }: UseIdeasOptions) {
  const hydrated = useHydrated()
  const { data: session } = useSession()
  const userId = session?.user?.id ?? getCachedUserId()
  const [size, setSize] = useState(1)

  const canQuery = enabled && Boolean(userId)
  const fetchLimit = size * PAGE_SIZE + 1

  const query = useMemo(() => {
    const conditions = ["user_id = ?", "status = ?"]
    if (search) conditions.push("content LIKE ?")
    return `SELECT * FROM ideas WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC, id DESC LIMIT ?`
  }, [search])

  const parameters = useMemo(() => {
    const params: unknown[] = [userId, status]
    if (search) params.push(`%${search}%`)
    params.push(fetchLimit)
    return params
  }, [userId, status, search, fetchLimit])

  const { data, isFetching, isLoading, error } = useQuery(
    canQuery ? query : "SELECT * FROM ideas WHERE 1=0",
    canQuery ? parameters : [],
  )

  const ideas = (data ?? []).slice(0, size * PAGE_SIZE).map(ideaRowToIdea)
  const hasMore = canQuery ? (data?.length ?? 0) > size * PAGE_SIZE : false
  const isLoadingMore = canQuery && isFetching && size > 1

  const create = useCallback(
    async (content: string): Promise<{ ok: boolean }> => {
      if (!userId) return { ok: false }
      const idea = await insertIdea(userId, content)
      return { ok: Boolean(idea) }
    },
    [userId],
  )

  const updateStatus = useCallback(
    async (id: string, newStatus: IdeaStatus): Promise<{ ok: boolean }> => {
      const now = new Date().toISOString()
      try {
        const existing = await db.getOptional<IdeaRow>("SELECT * FROM ideas WHERE id = ?", [id])
        if (!existing) return { ok: false }

        let deletedAt = existing.deleted_at ?? null
        if (newStatus === "deleted" && !deletedAt) {
          deletedAt = now
        } else if (newStatus !== "deleted" && existing.status === "deleted") {
          deletedAt = null
        }

        await db.execute(
          "UPDATE ideas SET status = ?, deleted_at = ?, updated_at = ? WHERE id = ?",
          [newStatus, deletedAt, now, id],
        )
        return { ok: true }
      } catch (error) {
        console.error("Failed to update status:", error)
        return { ok: false }
      }
    },
    [],
  )

  const updatePin = useCallback(
    async (id: string, pinned: boolean): Promise<{ ok: boolean }> => {
      const now = new Date().toISOString()
      try {
        await db.execute(
          "UPDATE ideas SET pinned = ?, updated_at = ? WHERE id = ?",
          [pinned ? 1 : 0, now, id],
        )
        return { ok: true }
      } catch (error) {
        console.error("Failed to update pin:", error)
        return { ok: false }
      }
    },
    [],
  )

  const updateColor = useCallback(
    async (id: string, background_color: string | null): Promise<{ ok: boolean }> => {
      const now = new Date().toISOString()
      try {
        await db.execute(
          "UPDATE ideas SET background_color = ?, updated_at = ? WHERE id = ?",
          [background_color, now, id],
        )
        return { ok: true }
      } catch (error) {
        console.error("Failed to update color:", error)
        return { ok: false }
      }
    },
    [],
  )

  const updateContent = useCallback(
    async (id: string, content: string): Promise<{ ok: boolean }> => {
      const now = new Date().toISOString()
      try {
        await db.execute(
          "UPDATE ideas SET content = ?, updated_at = ? WHERE id = ?",
          [content, now, id],
        )
        return { ok: true }
      } catch (error) {
        console.error("Failed to update content:", error)
        return { ok: false }
      }
    },
    [],
  )

  const permanentDelete = useCallback(
    async (id: string): Promise<{ ok: boolean }> => {
      try {
        await db.execute("DELETE FROM ideas WHERE id = ?", [id])
        return { ok: true }
      } catch (error) {
        console.error("Failed to delete idea:", error)
        return { ok: false }
      }
    },
    [],
  )

  return {
    ideas,
    error,
    isLoading: canQuery ? (hydrated ? isLoading : false) : false,
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
