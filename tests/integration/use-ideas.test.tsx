import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { SWRConfig } from "swr"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import { useIdeas } from "@/hooks/use-ideas"
import type React from "react"

function initialIdeas() {
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

let storedIdeas = initialIdeas()

const server = setupServer(
  http.get("/api/ideas", ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || "inbox"
    const search = url.searchParams.get("search")

    let ideas = storedIdeas.filter((i) => i.status === status)

    if (search) {
      ideas = ideas.filter((i) =>
        i.content.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return HttpResponse.json({ ideas })
  }),

  http.post("/api/ideas", async ({ request }) => {
    const body = (await request.json()) as { content: string }
    storedIdeas.push({
      id: `idea-${storedIdeas.length + 1}`,
      content: body.content,
      source: "web",
      status: "inbox",
      tags: null,
      pinned: false,
      background_color: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })
    return HttpResponse.json({ idea: storedIdeas[storedIdeas.length - 1] }, { status: 201 })
  }),

  http.patch("/api/ideas/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const idx = storedIdeas.findIndex((i) => i.id === params.id)
    if (idx !== -1) storedIdeas[idx] = { ...storedIdeas[idx], ...body } as typeof storedIdeas[0]
    return HttpResponse.json({ success: true })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  storedIdeas = initialIdeas()
})

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  )
}

describe("useIdeas", () => {
  it("fetches and returns inbox ideas", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.ideas).toHaveLength(2)
  })

  it("fetches archived ideas (empty)", async () => {
    const { result } = renderHook(() => useIdeas({ status: "archived" }), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.ideas).toHaveLength(0)
  })

  it("create() calls POST successfully", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => result.current.create("New test idea")),
    ).resolves.toEqual({ ok: true })
  })

  it("updateStatus() optimistically removes idea", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.ideas).toHaveLength(2)
    })

    await act(async () => {
      await result.current.updateStatus("idea-1", "archived")
    })

    const ideasAfter = result.current.ideas
    expect(ideasAfter.find((i) => i.id === "idea-1")).toBeUndefined()
  })

  it("handles fetch error gracefully", async () => {
    server.use(
      http.get("/api/ideas", () => HttpResponse.error()),
    )

    const { result } = renderHook(() => useIdeas({ status: "inbox" }), { wrapper })
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.ideas).toEqual([])
  })
})
