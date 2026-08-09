import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { createFakeDb, type FakeDb, type FakeRow } from "../helpers/powersync-fake"
import { useIdeas } from "@/hooks/use-ideas"
import { usePinnedIdeas } from "@/hooks/use-pinned-ideas"

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

function seed(): FakeRow[] {
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

describe("synchronization", () => {
  describe("create + list", () => {
    it("propagates a new idea into the inbox list", async () => {
      const { result } = renderHook(
        () => ({ ideas: useIdeas({ status: "inbox" }) }),
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

  describe("status changes across tabs", () => {
    it("updateStatus moves idea between inbox and archived and refreshes both", async () => {
      const { result } = renderHook(
        () => ({
          inbox: useIdeas({ status: "inbox" }),
          archived: useIdeas({ status: "archived" }),
        }),
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
