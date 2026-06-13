"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { fetcher, apiKeysApi } from "@/lib/api-client"

export interface ApiKey {
  id: string
  name: string
  key_preview: string
  full_key?: string
  created_at: string
  last_used_at: string | null
}

export function useApiKeys() {
  const { data, error, isLoading, mutate } = useSWR<{ keys: ApiKey[] }>(
    "/api/api-keys",
    fetcher
  )

  const create = useCallback(async (name: string) => {
    const response = await apiKeysApi.create(name)
    if (!response.ok) return null
    const body = await response.json()
    mutate()
    return body.key.full_key as string
  }, [mutate])

  const rename = useCallback(async (id: string, name: string) => {
    const response = await apiKeysApi.rename(id, name)
    if (response.ok) {
      mutate()
      return true
    }
    return false
  }, [mutate])

  const remove = useCallback(async (id: string) => {
    const response = await apiKeysApi.remove(id)
    if (response.ok) mutate()
  }, [mutate])

  return {
    keys: data?.keys ?? [],
    error,
    isLoading,
    create,
    rename,
    remove,
  }
}
