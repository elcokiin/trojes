import { describe, it, expect, vi, beforeEach } from "vitest"
import { resolveUserId } from "@/lib/offline-identity"

vi.mock("next-auth/react", () => ({
  getSession: vi.fn(),
}))

import { getSession } from "next-auth/react"

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
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "live-user" },
      expires: new Date().toISOString(),
    } as never)

    const id = await resolveUserId()

    expect(id).toBe("live-user")
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "trojes:offline-user-id",
      "live-user",
    )
  })

  it("falls back to the cached id when the session fetch resolves null (offline)", async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const id = await resolveUserId()

    expect(id).toBe("cached-user")
  })

  it("falls back to the cached id when the session fetch throws", async () => {
    vi.mocked(getSession).mockRejectedValue(new Error("network down"))

    const id = await resolveUserId()

    expect(id).toBe("cached-user")
  })

  it("returns null when both the session and cache are unavailable", async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    localStorageMock.getItem.mockImplementation(() => null)

    const id = await resolveUserId()

    expect(id).toBeNull()
  })
})
