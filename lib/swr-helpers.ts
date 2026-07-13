import { mutate } from "swr"

export function revalidateAllIdeas() {
  return mutate(
    (key) => typeof key === "string" && key.startsWith("/api/ideas"),
  )
}
