import { describe, it, expect, vi, beforeEach } from "vitest"
import { resolveUserId } from "@/lib/offline-identity"

const localStorageMock = vi.hoisted(() => {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockImplementation((key: string) => {
    const store = new Map<string, string>([
      ["trojes:offline-user-id", "cached-user"],
    ])
    return store.get(key) ?? null
  })
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
    writable: true,
  })
})

describe("resolveUserId", () => {
  it("returns the live session user id and refreshes the cache", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ user: { id: "live-user" } }),
    })

    const id = await resolveUserId()

    expect(id).toBe("live-user")
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "trojes:offline-user-id",
      "live-user",
    )
  })

  it("falls back to the cached id when the session fetch resolves null (offline)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ user: null }),
    })

    const id = await resolveUserId()

    expect(id).toBe("cached-user")
  })

  it("falls back to the cached id when the session fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"))

    const id = await resolveUserId()

    expect(id).toBe("cached-user")
  })

  it("returns null when both the session and cache are unavailable", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ user: null }),
    })
    localStorageMock.getItem.mockImplementation(() => null)

    const id = await resolveUserId()

    expect(id).toBeNull()
  })
})
