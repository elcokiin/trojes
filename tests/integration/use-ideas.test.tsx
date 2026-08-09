import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { createFakeDb, type FakeDb, type FakeRow } from "../helpers/powersync-fake"
import { useIdeas } from "@/hooks/use-ideas"

const holder = vi.hoisted(() => ({
  db: null as FakeDb | null,
  session: { user: { id: "user-1" } },
  status: "authenticated",
}))

vi.mock("@/lib/powersync/db", () => ({
  get db() {
    return holder.db
  },
}))

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: holder.session, status: holder.status }),
  getSession: async () => holder.session,
}))

vi.mock("@powersync/react", async () => {
  const React = await import("react")
  return {
    PowerSyncContext: React.createContext(null),
    useQuery: (sql: string, params: unknown[]) => {
      const [, force] = React.useReducer((c: number) => c + 1, 0)
      React.useEffect(() => {
        if (!holder.db) return
        return holder.db.subscribe(() => force())
      }, [])
      const db = holder.db
      return {
        data: db ? db.select(sql, params) : [],
        isLoading: !db,
        isFetching: false,
        error: db?.error ?? undefined,
      }
    },
  }
})

function row(partial: Partial<FakeRow> = {}): FakeRow {
  return {
    id: "idea-1",
    user_id: "user-1",
    content: "Test idea",
    source: "web",
    status: "inbox",
    tags: null,
    pinned: 0,
    background_color: null,
    deleted_at: null,
    created_at: "2024-06-01T12:00:00Z",
    updated_at: "2024-06-01T12:00:00Z",
    ...partial,
  }
}

function seed() {
  return [
    row({ id: "idea-1", content: "First idea" }),
    row({
      id: "idea-2",
      content: "Second idea",
      tags: '["important"]',
      pinned: 1,
      created_at: "2024-06-02T12:00:00Z",
      updated_at: "2024-06-02T12:00:00Z",
    }),
  ]
}

beforeEach(() => {
  holder.db = createFakeDb(seed())
})

describe("useIdeas", () => {
  it("fetches and returns inbox ideas", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.ideas).toHaveLength(2)
    expect(result.current.ideas[0].content).toBe("Second idea")
    expect(result.current.ideas[1].content).toBe("First idea")
  })

  it("maps rows into Idea objects", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const second = result.current.ideas.find((i) => i.id === "idea-2")
    expect(second?.tags).toEqual(["important"])
    expect(second?.pinned).toBe(true)
  })

  it("fetches archived ideas (empty)", async () => {
    const { result } = renderHook(() => useIdeas({ status: "archived" }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.ideas).toHaveLength(0)
  })

  it("create() inserts locally and returns ok", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => result.current.create("New test idea")),
    ).resolves.toEqual({ ok: true })

    await waitFor(() => expect(result.current.ideas).toHaveLength(3))
    expect(
      result.current.ideas.some((i) => i.content === "New test idea"),
    ).toBe(true)
  })

  it("updateStatus() updates the row and returns ok", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.ideas).toHaveLength(2)
    })

    const res = await act(async () =>
      result.current.updateStatus("idea-1", "archived"),
    )

    expect(res).toEqual({ ok: true })
    await waitFor(() => expect(result.current.ideas).toHaveLength(1))
  })

  it("handles fetch error gracefully", async () => {
    holder.db?.setError(new Error("network"))

    const { result } = renderHook(() => useIdeas({ status: "inbox" }))
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.ideas).toEqual([])
  })

  it("returns ok:false for create when the db write fails", async () => {
    const { result } = renderHook(() => useIdeas({ status: "inbox" }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const original = holder.db!.execute
    holder.db!.execute = async () => {
      throw new Error("boom")
    }

    await expect(
      act(async () => result.current.create("Will fail")),
    ).resolves.toEqual({ ok: false })

    holder.db!.execute = original
  })
})
