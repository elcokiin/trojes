import { mutate } from "swr"
import type { IdeaStatus } from "@/types/idea"

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
