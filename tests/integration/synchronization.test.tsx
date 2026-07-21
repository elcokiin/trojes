import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { SWRConfig, mutate as swrMutate } from "swr"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import { useIdeas } from "@/hooks/use-ideas"
import { usePinnedIdeas } from "@/hooks/use-pinned-ideas"
import { revalidateAllIdeas } from "@/lib/swr-helpers"
import { ideasApi } from "@/lib/api-client"
import type React from "react"

// ──────────────────────────────────────────
// Data store
// ──────────────────────────────────────────

interface StoredIdea {
  id: string
  content: string
  source: "web" | "api"
  status: "inbox" | "archived" | "deleted"
  tags: string[] | null
  pinned: boolean
  background_color: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

function initialIdeas(): StoredIdea[] {
  return [
    {
      id: "idea-1",
      content: "First idea",
      source: "web",
      status: "inbox",
      tags: null,
      pinned: false,
      background_color: null,
      created_at: "2024-06-01T12:00:00Z",
      updated_at: "2024-06-01T12:00:00Z",
      deleted_at: null,
    },
    {
      id: "idea-2",
      content: "Second idea",
      source: "api",
      status: "inbox",
      tags: ["important"],
      pinned: true,
      background_color: null,
      created_at: "2024-06-02T12:00:00Z",
      updated_at: "2024-06-02T12:00:00Z",
      deleted_at: null,
    },
  ]
}

let storedIdeas: StoredIdea[] = initialIdeas()

// ──────────────────────────────────────────
// Request tracking
// ──────────────────────────────────────────

let getRequests: { url: string }[] = []

function trackGet(url: string) {
  getRequests.push({ url })
}

function pinnedGetRequested(): boolean {
  return getRequests.some(
    (r) =>
      new URL(r.url, "http://localhost").searchParams.get("pinned") === "true",
  )
}

// ──────────────────────────────────────────
// MSW server
// ──────────────────────────────────────────

const server = setupServer(
  http.get("/api/ideas", ({ request }) => {
    const url = new URL(request.url)
    trackGet(url.toString())

    const status = url.searchParams.get("status") || "inbox"
    const search = url.searchParams.get("search")
    const pinned = url.searchParams.get("pinned") === "true"
    const cursor = url.searchParams.get("cursor")
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100)

    let ideas = storedIdeas.filter((i) => i.status === status)

    if (pinned) {
      ideas = storedIdeas.filter((i) => i.pinned && i.status === "inbox")
    }

    if (search) {
      ideas = ideas.filter((i) =>
        i.content.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (cursor) {
      ideas = ideas.filter((i) => i.created_at < cursor)
    }

    const hasMore = ideas.length > limit
    const page = hasMore ? ideas.slice(0, limit) : ideas
    const nextCursor = hasMore ? page[page.length - 1].created_at : null

    return HttpResponse.json({ ideas: page, nextCursor })
  }),

  http.post("/api/ideas", async ({ request }) => {
    const body = (await request.json()) as { content: string }
    const isApi = request.headers.get("authorization")?.startsWith("Bearer ")

    const newIdea: StoredIdea = {
      id: `idea-${storedIdeas.length + 1}`,
      content: body.content,
      source: isApi ? "api" : "web",
      status: "inbox",
      tags: null,
      pinned: false,
      background_color: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }
    storedIdeas.push(newIdea)
    return HttpResponse.json({ idea: newIdea }, { status: 201 })
  }),

  http.patch("/api/ideas/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const idx = storedIdeas.findIndex((i) => i.id === params.id)
    if (idx !== -1) {
      storedIdeas[idx] = { ...storedIdeas[idx], ...body } as StoredIdea
    }
    return HttpResponse.json({ idea: storedIdeas[idx] })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
afterAll(() => server.close())

afterEach(async () => {
  server.resetHandlers()
  storedIdeas = initialIdeas()
  getRequests = []
  await swrMutate(() => true, undefined, { revalidate: false })
})

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
  )
}

// ──────────────────────────────────────────
// Tests
// ──────────────────────────────────────────

describe("synchronization", () => {
  describe("create + list", () => {
    it("propagates a new idea into the inbox list", async () => {
      const { result } = renderHook(
        () => ({ ideas: useIdeas({ status: "inbox" }) }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.ideas.isLoading).toBe(false))
      const initialCount = result.current.ideas.ideas.length

      await act(async () => result.current.ideas.create("Fresh idea"))

      await waitFor(() => {
        expect(result.current.ideas.ideas.length).toBe(initialCount + 1)
        expect(
          result.current.ideas.ideas.some((i) => i.content === "Fresh idea"),
        ).toBe(true)
      })
    })
  })

  describe("pin/unpin + pinned tray", () => {
    it("pinning an idea via updatePin refreshes usePinnedIdeas", async () => {
      const { result } = renderHook(
        () => ({
          ideas: useIdeas({ status: "inbox" }),
          pinned: usePinnedIdeas(),
        }),
        { wrapper },
      )

      await waitFor(() => {
        expect(result.current.ideas.isLoading).toBe(false)
        expect(result.current.pinned.isLoading).toBe(false)
      })

      // Initial: only idea-2 is pinned
      expect(result.current.pinned.ideas).toHaveLength(1)
      expect(result.current.pinned.ideas[0].id).toBe("idea-2")

      // Pin idea-1
      await act(async () => result.current.ideas.updatePin("idea-1", true))

      // usePinnedIdeas must now contain idea-1
      await waitFor(() => {
        expect(result.current.pinned.ideas).toHaveLength(2)
        expect(
          result.current.pinned.ideas.some((i) => i.id === "idea-1"),
        ).toBe(true)
      })

      // The pinned API must have been called at least once after the initial fetch
      expect(pinnedGetRequested()).toBe(true)

      // The inbox list should also reflect the new pin state
      const pinnedIdea1 = result.current.ideas.ideas.find(
        (i) => i.id === "idea-1",
      )
      expect(pinnedIdea1?.pinned).toBe(true)
    })

    it("unpinning an idea via updatePin removes it from usePinnedIdeas and updates inbox", async () => {
      const { result } = renderHook(
        () => ({
          ideas: useIdeas({ status: "inbox" }),
          pinned: usePinnedIdeas(),
        }),
        { wrapper },
      )

      await waitFor(() => {
        expect(result.current.ideas.isLoading).toBe(false)
        expect(result.current.pinned.isLoading).toBe(false)
      })

      expect(result.current.pinned.ideas).toHaveLength(1)
      expect(result.current.pinned.ideas[0].id).toBe("idea-2")

      // Unpin idea-2
      await act(async () => result.current.ideas.updatePin("idea-2", false))

      // Pinned tray must reflect the change
      await waitFor(() => {
        expect(result.current.pinned.ideas).toHaveLength(0)
      })

      // Inbox must also reflect the change
      await waitFor(() => {
        const idea2 = result.current.ideas.ideas.find(
          (i) => i.id === "idea-2",
        )
        expect(idea2?.pinned).toBe(false)
      })
    })
  })

  describe("revalidateAllIdeas utility", () => {
    it("triggers re-fetch for /api/ideas?pinned=true (regular SWR key)", async () => {
      const { result } = renderHook(
        () => ({ pinned: usePinnedIdeas() }),
        { wrapper },
      )

      await waitFor(() =>
        expect(result.current.pinned.isLoading).toBe(false),
      )

      // Simulate what Dashboard/MobileLayout capture does
      await act(async () => {
        await ideasApi.update("idea-2", { pinned: false })
        revalidateAllIdeas()
      })

      // Must re-fetch the pinned data
      await waitFor(() => {
        expect(result.current.pinned.ideas).toHaveLength(0)
      })
    })
  })

  describe("cross-tab sync", () => {
    it("updateStatus moves idea between tabs and refreshes both", async () => {
      const { result } = renderHook(
        () => ({
          inbox: useIdeas({ status: "inbox" }),
          archived: useIdeas({ status: "archived" }),
        }),
        { wrapper },
      )

      await waitFor(() => {
        expect(result.current.inbox.isLoading).toBe(false)
        expect(result.current.archived.isLoading).toBe(false)
      })

      expect(result.current.inbox.ideas).toHaveLength(2)
      expect(result.current.archived.ideas).toHaveLength(0)

      // Move idea-1 to archived
      await act(async () =>
        result.current.inbox.updateStatus("idea-1", "archived"),
      )

      // Inbox must lose idea-1
      await waitFor(() => {
        expect(result.current.inbox.ideas).toHaveLength(1)
        expect(result.current.inbox.ideas[0].id).toBe("idea-2")
      })

      // Archived must gain idea-1
      await waitFor(() => {
        expect(result.current.archived.ideas).toHaveLength(1)
        expect(result.current.archived.ideas[0].id).toBe("idea-1")
      })
    })
  })
})
