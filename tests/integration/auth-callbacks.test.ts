import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { authOptions } from "@/lib/auth"
import type { Account } from "next-auth"

vi.mock("next-auth/providers/google", () => ({
  default: vi.fn(() => ({ id: "google", name: "Google", type: "oauth" })),
}))

vi.mock("@/db/users", () => ({
  findUserIdByEmail: vi.fn(),
  createUser: vi.fn(),
  updateUserProfile: vi.fn(),
  accountExists: vi.fn(),
  createAccount: vi.fn(),
}))

import {
  findUserIdByEmail,
  createUser,
  updateUserProfile,
  accountExists,
  createAccount,
} from "@/db/users"

const { signIn, session, jwt } = authOptions.callbacks!

function signInParams(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: "google-oauth-id", name: "Test User", email: "test@example.com", image: "https://example.com/pic.jpg" },
    account: { provider: "google", type: "oauth", providerAccountId: "google-123" },
    ...overrides,
  } as Parameters<typeof signIn>[0]
}

function sessionParams(overrides: Record<string, unknown> = {}) {
  return {
    session: { user: { email: "test@example.com" }, expires: "2099-01-01T00:00:00Z" },
    token: { sub: "token-sub-1" },
    ...overrides,
  } as Parameters<typeof session>[0]
}

function jwtParams(overrides: Record<string, unknown> = {}) {
  return {
    token: {},
    user: { id: "user-1", name: "Test" },
    ...overrides,
  } as Parameters<typeof jwt>[0]
}

describe("signIn callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("new user", () => {
    it("creates user and account when email is not in DB", async () => {
      vi.mocked(findUserIdByEmail).mockResolvedValue(null)
      vi.mocked(createUser).mockResolvedValue({ id: "new-1" })
      vi.mocked(accountExists).mockResolvedValue(false)

      const params = signInParams()
      const result = await signIn(params)

      expect(createUser).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/pic.jpg",
      })
      expect(createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "new-1",
          provider: "google",
          provider_account_id: "google-123",
        }),
      )
      expect(result).toBe(true)
      expect(params.user.id).toBe("new-1")
    })

    it("creates user without name or image when Google omits them", async () => {
      vi.mocked(findUserIdByEmail).mockResolvedValue(null)
      vi.mocked(createUser).mockResolvedValue({ id: "minimal-1" })
      vi.mocked(accountExists).mockResolvedValue(false)

      const params = signInParams({
        user: { id: "google-456", email: "minimal@example.com" },
      })
      const result = await signIn(params)

      expect(createUser).toHaveBeenCalledWith({
        name: undefined,
        email: "minimal@example.com",
        image: undefined,
      })
      expect(result).toBe(true)
    })
  })

  describe("existing user", () => {
    it("updates profile and creates account when provider is new", async () => {
      vi.mocked(findUserIdByEmail).mockResolvedValue("existing-1")
      vi.mocked(accountExists).mockResolvedValue(false)

      const params = signInParams()
      const result = await signIn(params)

      expect(updateUserProfile).toHaveBeenCalledWith({
        id: "existing-1",
        name: "Test User",
        image: "https://example.com/pic.jpg",
      })
      expect(createAccount).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it("updates profile without creating account when provider is already linked", async () => {
      vi.mocked(findUserIdByEmail).mockResolvedValue("existing-1")
      vi.mocked(accountExists).mockResolvedValue(true)

      const params = signInParams()
      const result = await signIn(params)

      expect(updateUserProfile).toHaveBeenCalled()
      expect(createAccount).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })

  describe("error handling", () => {
    it("denies login and logs error when DB throws", async () => {
      vi.mocked(findUserIdByEmail).mockRejectedValue(new Error("DB connection failed"))
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const result = await signIn(signInParams())

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})

describe("session callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("assigns user.id when email exists in DB", async () => {
    vi.mocked(findUserIdByEmail).mockResolvedValue("uid-1")

    const result = await session(sessionParams())

    expect(result.user?.id).toBe("uid-1")
  })

  it("does not assign id when email is not found in DB", async () => {
    vi.mocked(findUserIdByEmail).mockResolvedValue(null)

    const result = await session(sessionParams())

    expect(result.user?.id).toBeUndefined()
  })

  it.each([
    { desc: "session.user has no email", params: sessionParams({ session: { user: {} } }) },
    { desc: "token has no sub", params: sessionParams({ token: {} }) },
  ])("skips DB lookup when $desc", async ({ params }) => {
    await session(params)

    expect(findUserIdByEmail).not.toHaveBeenCalled()
  })
})

describe("jwt callback", () => {
  it("assigns token.id from user.id", async () => {
    const result = await jwt(jwtParams())

    expect(result.id).toBe("user-1")
  })

  it("returns token unchanged when user is absent", async () => {
    const result = await jwt(jwtParams({ user: undefined }))

    expect(result.id).toBeUndefined()
  })
})
