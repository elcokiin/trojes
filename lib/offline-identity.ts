import { getSession } from "next-auth/react"

const USER_ID_KEY = "trojes:offline-user-id"

export function getCachedUserId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(USER_ID_KEY)
  } catch {
    return null
  }
}

export function setCachedUserId(id: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(USER_ID_KEY, id)
  } catch {
    // ignore storage errors (private mode, quota)
  }
}

export function clearCachedUserId(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(USER_ID_KEY)
  } catch {
    // ignore storage errors
  }
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

/**
 * Resolve the current user id for local writes. Prefers the live NextAuth
 * session (and refreshes the cache when available), falling back to the
 * cached identity when the network session cannot be reached (offline).
 *
 * Note: NextAuth's `getSession()` does not throw when offline — it swallows
 * the fetch failure internally and resolves with `null`. So the cached-id
 * fallback must cover the "resolved null" path, not just thrown errors.
 */
export async function resolveUserId(): Promise<string | null> {
  try {
    const session = await getSession()
    const id = session?.user?.id ?? null
    if (id) setCachedUserId(id)
    return id ?? getCachedUserId()
  } catch {
    return getCachedUserId()
  }
}
