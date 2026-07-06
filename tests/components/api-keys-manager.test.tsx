import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ApiKeysManager } from "@/components/settings/api-keys-manager"

let mockIsLoading = false
let mockKeys: Array<{
  id: string
  name: string
  key_preview: string
  created_at: string
  last_used_at: string | null
}> = [
  {
    id: "key-1",
    name: "My Test Key",
    key_preview: "abcd",
    created_at: "2024-01-15T10:00:00Z",
    last_used_at: null,
  },
  {
    id: "key-2",
    name: "Workflow Key",
    key_preview: "ef01",
    created_at: "2024-03-20T14:30:00Z",
    last_used_at: "2024-06-01T08:00:00Z",
  },
]

const mockCreate = vi.fn()
const mockRename = vi.fn()
const mockRemove = vi.fn()

vi.mock("@/hooks/use-api-keys", () => ({
  useApiKeys: () => ({
    keys: mockKeys,
    isLoading: mockIsLoading,
    create: mockCreate,
    rename: mockRename,
    remove: mockRemove,
  }),
}))

function findRenameButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button svg.lucide-pencil')).map(
    (svg) => svg.closest("button")!,
  )
}

function findDeleteButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll("button svg.lucide-trash2")).map(
    (svg) => svg.closest("button")!,
  )
}

function findCopyButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector("button svg.lucide-copy")?.closest("button") ?? null
}

function findCreateButton(): HTMLButtonElement | null {
  return screen.getByText("Create").closest("button")
}

describe("ApiKeysManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue("trojes_full_key_here")
    mockRename.mockResolvedValue(true)
    mockIsLoading = false
    mockKeys = [
      {
        id: "key-1",
        name: "My Test Key",
        key_preview: "abcd",
        created_at: "2024-01-15T10:00:00Z",
        last_used_at: null,
      },
      {
        id: "key-2",
        name: "Workflow Key",
        key_preview: "ef01",
        created_at: "2024-03-20T14:30:00Z",
        last_used_at: "2024-06-01T08:00:00Z",
      },
    ]
  })

  it("renders the create section", () => {
    render(<ApiKeysManager />)
    expect(screen.getByText("Create API key")).toBeTruthy()
    expect(
      screen.getByPlaceholderText("e.g. n8n local workflow"),
    ).toBeTruthy()
  })

  it("renders existing keys", () => {
    render(<ApiKeysManager />)
    expect(screen.getByText("My Test Key")).toBeTruthy()
    expect(screen.getByText("Workflow Key")).toBeTruthy()
  })

  it("shows key previews", () => {
    render(<ApiKeysManager />)
    expect(screen.getByText(/abcd/)).toBeTruthy()
    expect(screen.getByText(/ef01/)).toBeTruthy()
  })

  it("create button is disabled with empty name", () => {
    render(<ApiKeysManager />)
    const createButton = findCreateButton()
    expect(createButton).toBeDisabled()
  })

  it("create key shows full key once after creation", async () => {
    render(<ApiKeysManager />)
    const input = screen.getByPlaceholderText("e.g. n8n local workflow")
    await userEvent.type(input, "New Key")
    const createButton = findCreateButton()
    await userEvent.click(createButton!)
    expect(mockCreate).toHaveBeenCalledWith("New Key")
    expect(screen.getByText(/trojes_full_key_here/)).toBeTruthy()
  })

  it("copy button copies full key to clipboard", async () => {
    const writeText = vi.fn()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    })
    const { container } = render(<ApiKeysManager />)
    const input = screen.getByPlaceholderText("e.g. n8n local workflow")
    await userEvent.type(input, "New Key")
    await userEvent.click(findCreateButton()!)
    const copyButton = findCopyButton(container)
    expect(copyButton).toBeTruthy()
    await userEvent.click(copyButton!)
    expect(writeText).toHaveBeenCalledWith("trojes_full_key_here")
  })

  it("delete key calls remove", async () => {
    const { container } = render(<ApiKeysManager />)
    const deleteButtons = findDeleteButtons(container)
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2)
    await userEvent.click(deleteButtons[0])
    expect(mockRemove).toHaveBeenCalledWith("key-1")
  })

  it("inline rename works: click pencil, type, press Enter", async () => {
    const { container } = render(<ApiKeysManager />)
    const renameButtons = findRenameButtons(container)
    await userEvent.click(renameButtons[0])
    const renameInput = screen.getByDisplayValue("My Test Key")
    await userEvent.clear(renameInput)
    await userEvent.type(renameInput, "Renamed Key{Enter}")
    expect(mockRename).toHaveBeenCalledWith("key-1", "Renamed Key")
  })

  it("shows last_used_at when available", () => {
    render(<ApiKeysManager />)
    expect(screen.getByText(/Last used/)).toBeTruthy()
  })

  it("shows loading state", () => {
    mockIsLoading = true
    render(<ApiKeysManager />)
    expect(screen.getByText("Loading keys...")).toBeTruthy()
  })

  it("shows 'No keys yet' when keys array is empty", () => {
    mockKeys = []
    render(<ApiKeysManager />)
    expect(screen.getByText("No keys yet.")).toBeTruthy()
  })
})
