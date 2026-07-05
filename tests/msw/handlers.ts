import { http, HttpResponse } from "msw"

const defaultIdeas = [
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

export const handlers = [
  http.get("/api/ideas", ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || "inbox"
    const search = url.searchParams.get("search")
    const pinned = url.searchParams.get("pinned") === "true"

    let ideas = defaultIdeas.filter((i) => i.status === status)

    if (pinned) {
      ideas = defaultIdeas.filter((i) => i.pinned && i.status === "inbox")
    }

    if (search) {
      ideas = ideas.filter((i) =>
        i.content.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return HttpResponse.json({ ideas })
  }),

  http.post("/api/ideas", async ({ request }) => {
    const body = (await request.json()) as { content: string }
    const isApi = request.headers.get("authorization")?.startsWith("Bearer ")

    return HttpResponse.json(
      {
        idea: {
          id: "idea-new",
          content: body.content,
          source: isApi ? "api" : "web",
          status: "inbox",
          tags: null,
          pinned: false,
          background_color: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      },
      { status: 201 },
    )
  }),

  http.patch("/api/ideas/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      idea: {
        id: params.id,
        ...body,
        updated_at: new Date().toISOString(),
      },
    })
  }),

  http.delete("/api/ideas/:id", () => {
    return HttpResponse.json({ success: true })
  }),
]
