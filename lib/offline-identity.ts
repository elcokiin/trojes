const STORAGE_KEY = "trojes:offline-user-id"

export function getCachedUserId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY)
}

export function setCachedUserId(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, userId)
}

export function clearCachedUserId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

export async function resolveUserId(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/session")
    const session = await res.json()
    const id = session?.user?.id
    if (id) {
      setCachedUserId(id)
      return id
    }
  } catch {
    // Fetch failed (offline) - fall through to cache
  }

  return getCachedUserId()
}
