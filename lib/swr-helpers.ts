import { mutate } from "swr"
import type { Idea, IdeaStatus } from "@/types/idea"

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
