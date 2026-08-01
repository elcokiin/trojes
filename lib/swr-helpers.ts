import { mutate } from "swr"
import type { Idea, IdeaStatus } from "@/types/idea"

function infiniteIdeaPagesUpdater(
  pages: { ideas: Idea[]; nextCursor: string | null }[] | undefined,
  updateFn: (ideas: Idea[]) => Idea[],
) {
  if (!pages) return pages
  return pages.map((page) => ({ ...page, ideas: updateFn(page.ideas) }))
}

function infiniteKeyMatcher(key: unknown): key is string {
  return typeof key === "string" && key.startsWith("$inf$/api/ideas")
}

function inboxInfiniteKeyMatcher(key: unknown): key is string {
  return typeof key === "string" && key.startsWith("$inf$/api/ideas?status=inbox")
}

export function addIdeaToCache(idea: Idea) {
  mutate(
    (key) =>
      typeof key === "string" && key.startsWith("$inf$/api/ideas?status=inbox"),
    (pages: { ideas: Idea[]; nextCursor: string | null }[] | undefined) => {
      if (!pages || pages.length === 0) return pages
      const [first, ...rest] = pages
      return [{ ...first, ideas: [idea, ...first.ideas] }, ...rest]
    },
    { revalidate: false },
  )
}

export function replaceIdeaInCache(tempId: string, idea: Idea) {
  mutate(
    inboxInfiniteKeyMatcher,
    (pages) =>
      infiniteIdeaPagesUpdater(pages, (ideas) =>
        ideas.map((i) => (i.id === tempId ? idea : i)),
      ),
    { revalidate: false },
  )
}

export function removeIdeaFromCache(id: string) {
  mutate(
    infiniteKeyMatcher,
    (pages) =>
      infiniteIdeaPagesUpdater(pages, (ideas) =>
        ideas.filter((i) => i.id !== id),
      ),
    { revalidate: false },
  )
}

export function applyIdeaUpdate(id: string, updater: (idea: Idea) => Idea) {
  mutate(
    infiniteKeyMatcher,
    (pages) =>
      infiniteIdeaPagesUpdater(pages, (ideas) =>
        ideas.map((i) => (i.id === id ? updater(i) : i)),
      ),
    { revalidate: false },
  )
}

export function revalidateAllIdeas() {
  const statuses: IdeaStatus[] = ["inbox", "archived", "deleted"]

  return Promise.all([
    // Revalidate regular SWR keys (pinned tray, individual pages)
    mutate((key) => {
      if (typeof key !== "string") return false
      if (key.startsWith("/api/ideas")) return true
      return false
    }),
    // Revalidate infinite keys directly (mutate filter skips $inf$ keys)
    ...statuses.map((s) =>
      mutate(`$inf$/api/ideas?status=${s}&limit=50`),
    ),
  ])
}
