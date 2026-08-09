import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { PowerSyncProvider } from "@/components/providers/powersync-provider"

const holder = vi.hoisted(() => ({
  status: "unauthenticated" as string,
  session: null as { user: { id: string } } | null,
  db: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnectAndClear: vi.fn().mockResolvedValue(undefined),
  },
  connector: { isConnector: true },
}))

vi.mock("@/lib/powersync/db", () => ({
  get db() {
    return holder.db
  },
  get connector() {
    return holder.connector
  },
}))

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: holder.session, status: holder.status }),
}))

vi.mock("@powersync/react", async () => {
  const React = await import("react")
  return {
    PowerSyncContext: React.createContext(null),
  }
})

const USER_ID_KEY = "trojes:offline-user-id"

function renderProvider() {
  return render(
    <PowerSyncProvider>
      <div>children</div>
    </PowerSyncProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  holder.status = "unauthenticated"
  holder.session = null
  holder.db.connect.mockClear()
  holder.db.disconnectAndClear.mockClear()
})

describe("PowerSyncProvider", () => {
  it("connects and caches the id for a fresh authenticated user", () => {
    holder.status = "authenticated"
    holder.session = { user: { id: "user-1" } }

    renderProvider()

    expect(holder.db.connect).toHaveBeenCalledWith(holder.connector)
    expect(holder.db.disconnectAndClear).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(USER_ID_KEY)).toBe("user-1")
  })

  it("reconnects without clearing when the same user is authenticated again", () => {
    window.localStorage.setItem(USER_ID_KEY, "user-1")
    holder.status = "authenticated"
    holder.session = { user: { id: "user-1" } }

    renderProvider()

    expect(holder.db.connect).toHaveBeenCalledWith(holder.connector)
    expect(holder.db.disconnectAndClear).not.toHaveBeenCalled()
  })

  it("clears the mirror and reconnects when a different user signs in", async () => {
    window.localStorage.setItem(USER_ID_KEY, "user-1")
    holder.status = "authenticated"
    holder.session = { user: { id: "user-2" } }

    renderProvider()

    expect(holder.db.disconnectAndClear).toHaveBeenCalled()
    await waitFor(() =>
      expect(holder.db.connect).toHaveBeenCalledWith(holder.connector),
    )
    expect(window.localStorage.getItem(USER_ID_KEY)).toBe("user-2")
  })

  it("does not touch the db when there is no authenticated session", () => {
    holder.status = "unauthenticated"
    holder.session = null

    renderProvider()

    expect(holder.db.connect).not.toHaveBeenCalled()
    expect(holder.db.disconnectAndClear).not.toHaveBeenCalled()
  })
})
