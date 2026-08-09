import { describe, it, expect, vi, beforeEach } from "vitest"
import { createIdea, insertIdea } from "@/lib/create-idea"

const executeMock = vi.hoisted(() => vi.fn())

vi.mock("@/lib/powersync/db", () => ({
  db: { execute: executeMock },
}))

vi.mock("@/lib/offline-identity", () => ({
  resolveUserId: vi.fn(),
  setCachedUserId: vi.fn(),
}))

import { resolveUserId } from "@/lib/offline-identity"

beforeEach(() => {
  vi.clearAllMocks()
  executeMock.mockResolvedValue({ rowsAffected: 1 })
})

describe("insertIdea", () => {
  it("inserts a trimmed idea locally and returns it", async () => {
    const idea = await insertIdea("user-1", "  My new idea  ")

    expect(idea).not.toBeNull()
    expect(idea?.content).toBe("My new idea")
    expect(idea?.status).toBe("inbox")
    expect(idea?.source).toBe("web")
    expect(idea?.pinned).toBe(false)
    expect(executeMock).toHaveBeenCalledTimes(1)

    const [sql, params] = executeMock.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain("INSERT INTO ideas")
    expect(params[1]).toBe("user-1")
    expect(params[2]).toBe("My new idea")
  })

  it("returns null for blank content without touching the db", async () => {
    const result = await insertIdea("user-1", "   ")

    expect(result).toBeNull()
    expect(executeMock).not.toHaveBeenCalled()
  })

  it("returns null when the db write fails", async () => {
    executeMock.mockRejectedValue(new Error("disk full"))

    const result = await insertIdea("user-1", "will fail")

    expect(result).toBeNull()
  })
})

describe("createIdea", () => {
  it("posts the content and returns ok with the created idea", async () => {
    vi.mocked(resolveUserId).mockResolvedValue("user-1")

    const result = await createIdea("My new idea")

    expect(result.ok).toBe(true)
    expect(result.idea).toBeDefined()
    expect(result.idea?.content).toBe("My new idea")
  })

  it("returns ok:false when there is no user id", async () => {
    vi.mocked(resolveUserId).mockResolvedValue(null)

    const result = await createIdea("Will not post")

    expect(result.ok).toBe(false)
    expect(result.idea).toBeUndefined()
    expect(executeMock).not.toHaveBeenCalled()
  })

  it("returns ok:false when the db write fails and does not throw", async () => {
    vi.mocked(resolveUserId).mockResolvedValue("user-1")
    executeMock.mockRejectedValue(new Error("boom"))

    const result = await createIdea("Will fail")

    expect(result.ok).toBe(false)
    expect(result.idea).toBeUndefined()
  })
})
