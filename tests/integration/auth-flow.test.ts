import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/api-keys", () => ({
  getUserIdFromApiKey: vi.fn(),
}))

import { getServerSession } from "next-auth"
import { getUserIdFromApiKey } from "@/lib/api-keys"

describe("getAuthenticatedUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns userId from session when session exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "session-user-1" } })
    const result = await getAuthenticatedUserId()
    expect(result).toBe("session-user-1")
  })

  it("returns userId from valid Bearer API key", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    vi.mocked(getUserIdFromApiKey).mockResolvedValue("api-key-user-1")
    const request = new NextRequest(new Request("http://localhost", {
      headers: { Authorization: "Bearer troje_valid_api_key_here" },
    }))
    const result = await getAuthenticatedUserId(request)
    expect(result).toBe("api-key-user-1")
    expect(getUserIdFromApiKey).toHaveBeenCalledWith("troje_valid_api_key_here")
  })

  it("returns null when no session and no auth header", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new NextRequest(new Request("http://localhost"))
    const result = await getAuthenticatedUserId(request)
    expect(result).toBeNull()
  })

  it("returns null when no session and invalid API key", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    vi.mocked(getUserIdFromApiKey).mockResolvedValue(null)
    const request = new NextRequest(new Request("http://localhost", {
      headers: { Authorization: "Bearer troje_invalid_key" },
    }))
    const result = await getAuthenticatedUserId(request)
    expect(result).toBeNull()
  })

  it("returns null when auth header is not Bearer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const request = new NextRequest(new Request("http://localhost", {
      headers: { Authorization: "Basic some_token" },
    }))
    const result = await getAuthenticatedUserId(request)
    expect(result).toBeNull()
  })

  it("returns null when request is undefined and no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const result = await getAuthenticatedUserId()
    expect(result).toBeNull()
  })
})
