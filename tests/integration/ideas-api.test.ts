import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/ideas/route"

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}))

vi.mock("@/db/ideas", () => ({
  findIdeas: vi.fn(),
  findPinnedIdeas: vi.fn(),
  createIdea: vi.fn(),
}))

import { getAuthenticatedUserId } from "@/lib/auth"
import { findIdeas, findPinnedIdeas, createIdea } from "@/db/ideas"
import type { Idea } from "@/db/schema"

const mockIdea = {
  id: "idea-1",
  user_id: "user-1",
  content: "Test idea",
  source: "web",
  status: "inbox",
  tags: null,
  pinned: false,
  background_color: null,
  deleted_at: null,
  created_at: "2024-06-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
} satisfies Idea

describe("GET /api/ideas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthenticatedUserId).mockResolvedValue("user-1")
  })

  it("returns ideas filtered by status=inbox", async () => {
    vi.mocked(findIdeas).mockResolvedValue([mockIdea])
    const request = new NextRequest(new Request("http://localhost/api/ideas?status=inbox"))
    const res = await GET(request)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ideas).toHaveLength(1)
    expect(body.ideas[0].content).toBe("Test idea")
    expect(findIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ status: "inbox" }),
    )
  })

  it("returns ideas filtered by status=archived", async () => {
    vi.mocked(findIdeas).mockResolvedValue([{ ...mockIdea, status: "archived" }])
    const request = new NextRequest(new Request("http://localhost/api/ideas?status=archived"))
    const res = await GET(request)
    expect(res.status).toBe(200)
    expect(findIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ status: "archived" }),
    )
  })

  it("returns ideas filtered by status=deleted", async () => {
    vi.mocked(findIdeas).mockResolvedValue([{ ...mockIdea, status: "deleted" }])
    const request = new NextRequest(new Request("http://localhost/api/ideas?status=deleted"))
    const res = await GET(request)
    expect(res.status).toBe(200)
    expect(findIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ status: "deleted" }),
    )
  })

  it("defaults invalid status to inbox", async () => {
    vi.mocked(findIdeas).mockResolvedValue([mockIdea])
    const request = new NextRequest(new Request("http://localhost/api/ideas?status=invalid"))
    await GET(request)
    expect(findIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ status: "inbox" }),
    )
  })

  it("filters by search keyword", async () => {
    vi.mocked(findIdeas).mockResolvedValue([mockIdea])
    const request = new NextRequest(new Request("http://localhost/api/ideas?status=inbox&search=Test"))
    await GET(request)
    expect(findIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ search: "Test" }),
    )
  })

  it("returns pinned ideas when pinned=true", async () => {
    vi.mocked(findPinnedIdeas).mockResolvedValue([{ ...mockIdea, pinned: true }])
    const request = new NextRequest(new Request("http://localhost/api/ideas?pinned=true"))
    const res = await GET(request)
    expect(res.status).toBe(200)
    expect(findPinnedIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
    )
  })

  it("returns 401 when unauthorized", async () => {
    vi.mocked(getAuthenticatedUserId).mockResolvedValue(null)
    const request = new NextRequest(new Request("http://localhost/api/ideas"))
    const res = await GET(request)
    expect(res.status).toBe(401)
  })
})

describe("POST /api/ideas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthenticatedUserId).mockResolvedValue("user-1")
    vi.mocked(createIdea).mockResolvedValue(mockIdea)
  })

  it("creates idea with source=web when session user (no Bearer)", async () => {
    const request = new NextRequest(new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "New idea" }),
    }))
    const res = await POST(request)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(createIdea).toHaveBeenCalledWith(
      expect.objectContaining({ source: "web" }),
    )
  })

  it("creates idea with source=api when Bearer token present", async () => {
    const request = new NextRequest(new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer trojes_some_key",
      },
      body: JSON.stringify({ content: "New idea" }),
    }))
    const res = await POST(request)
    expect(res.status).toBe(201)
    expect(createIdea).toHaveBeenCalledWith(
      expect.objectContaining({ source: "api" }),
    )
  })

  it("returns 400 when content is empty", async () => {
    const request = new NextRequest(new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "" }),
    }))
    const res = await POST(request)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Content is required")
  })

  it("returns 400 when content is missing", async () => {
    const request = new NextRequest(new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }))
    const res = await POST(request)
    expect(res.status).toBe(400)
  })

  it("returns 401 when no auth", async () => {
    vi.mocked(getAuthenticatedUserId).mockResolvedValue(null)
    const request = new NextRequest(new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "New idea" }),
    }))
    const res = await POST(request)
    expect(res.status).toBe(401)
  })

  it("trims content before creating", async () => {
    const request = new NextRequest(new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "  trimmed  " }),
    }))
    await POST(request)
    expect(createIdea).toHaveBeenCalledWith(
      expect.objectContaining({ content: "trimmed" }),
    )
  })
})
