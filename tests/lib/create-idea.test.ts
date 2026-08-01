import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { mutate as swrMutate } from "swr"
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
import { createIdea } from "@/lib/create-idea"

const server = setupServer(
  http.post("/api/ideas", async ({ request }) => {
    const body = (await request.json()) as { content: string }
    return HttpResponse.json(
      {
        idea: {
          id: "idea-1",
          content: body.content,
          source: "web",
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
)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  swrMutate(() => true, undefined, { revalidate: false })
})

describe("createIdea", () => {
  it("posts the content and returns ok with the created idea", async () => {
    const result = await createIdea("My new idea")

    expect(result.ok).toBe(true)
    expect(result.idea).toBeDefined()
    expect(result.idea?.content).toBe("My new idea")
  })

  it("returns ok:false when the API fails and does not throw", async () => {
    server.use(
      http.post("/api/ideas", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    )

    const result = await createIdea("Will fail")

    expect(result.ok).toBe(false)
    expect(result.idea).toBeUndefined()
  })
})
