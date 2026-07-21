import { mutate } from "swr"

export function revalidateAllIdeas() {
  return mutate((key) => {
    if (typeof key !== "string") return false
    if (key.startsWith("/api/ideas")) return true
    if (key.startsWith("$inf$/api/ideas")) return true
    return false
  })
}
