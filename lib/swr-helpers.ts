import { mutate } from "swr"

export function revalidateAllIdeas() {
  return mutate((key) => {
    if (typeof key === "string") return key.startsWith("/api/ideas")
    if (Array.isArray(key) && key[0] === "$inf$" && typeof key[1] === "string")
      return key[1].startsWith("/api/ideas")
    return false
  })
}
