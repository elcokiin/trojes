import { ideasApi } from "@/lib/api-client"
import {
  addIdeaToCache,
  removeIdeaFromCache,
  replaceIdeaInCache,
  revalidateAllIdeas,
} from "@/lib/swr-helpers"
import type { Idea } from "@/types/idea"

export async function createIdea(content: string): Promise<{ ok: boolean; idea?: Idea }> {
  const tempId = `temp_${Date.now()}`
  addIdeaToCache({
    id: tempId,
    content,
    status: "inbox",
    source: "web",
    pinned: false,
    background_color: null,
    tags: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  })

  const response = await ideasApi.create(content)
  let idea: Idea | undefined
  if (response.ok) {
    const body = (await response.json()) as { idea: Idea }
    idea = body.idea
    replaceIdeaInCache(tempId, idea)
  } else {
    removeIdeaFromCache(tempId)
  }

  revalidateAllIdeas()
  return { ok: response.ok, idea }
}
