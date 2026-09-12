import { describe, it, expect, vi, beforeEach } from "vitest"
import { Effect } from "effect"
import {
  OfflineIdentity,
  OfflineIdentityLive,
} from "@/lib/outbox/offline-identity"

const STORAGE_KEY = "trojes:offline-user-id"

function runWithLive<A>(effect: Effect.Effect<A, any>): Promise<A> {
  return Effect.runPromise(effect.pipe(Effect.provide(OfflineIdentityLive)))
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.setItem(STORAGE_KEY, "cached-user")
})

describe("OfflineIdentity", () => {
  describe("resolveUserId", () => {
    it("returns the live session user id and refreshes the cache", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ user: { id: "live-user" } }),
      })

      const id = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.resolveUserId()
        }),
      )

      expect(id).toBe("live-user")
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        "live-user",
      )
    })

    it("falls back to the cached id when the session fetch resolves null", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ user: null }),
      })

      const id = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.resolveUserId()
        }),
      )

      expect(id).toBe("cached-user")
    })

    it("falls back to the cached id when the session fetch throws", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"))

      const id = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.resolveUserId()
        }),
      )

      expect(id).toBe("cached-user")
    })

    it("returns null when both the session and cache are unavailable", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ user: null }),
      })
      window.localStorage.clear()

      const id = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.resolveUserId()
        }),
      )

      expect(id).toBeNull()
    })
  })

  describe("getCachedUserId / setCachedUserId / clearCachedUserId", () => {
    it("returns the cached user id", async () => {
      const result = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.getCachedUserId()
        }),
      )

      expect(result).toBe("cached-user")
    })

    it("stores and retrieves a user id", async () => {
      await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          yield* identity.setCachedUserId("new-user")
        }),
      )

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        "new-user",
      )

      const result = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.getCachedUserId()
        }),
      )

      expect(result).toBe("new-user")
    })

    it("clears the cached user id", async () => {
      await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          yield* identity.clearCachedUserId()
        }),
      )

      expect(window.localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY)
    })
  })

  describe("isOnline", () => {
    it("returns true when online", async () => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
      })

      const result = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.isOnline()
        }),
      )

      expect(result).toBe(true)
    })

    it("returns false when offline", async () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      })

      const result = await runWithLive(
        Effect.gen(function* () {
          const identity = yield* OfflineIdentity
          return yield* identity.isOnline()
        }),
      )

      expect(result).toBe(false)
    })
  })
})
