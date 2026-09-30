import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MobileCapturePage } from "@/components/app/mobile-capture"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  create: vi.fn(),
  search: "",
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, back: mocks.back }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}))

vi.mock("@/hooks/use-ideas", () => ({
  useIdeas: () => ({ create: mocks.create }),
}))

vi.mock("@/hooks/use-hotkey-scope", () => ({
  useSuppressGlobalHotkeys: vi.fn(),
}))

vi.mock("@/components/editor/editor-x", () => ({
  EditorX: ({
    onChange,
    onEscape,
    onModEnter,
    value,
    placeholder,
    disabled,
  }: {
    onChange?: (v: string) => void
    onEscape?: () => void
    onModEnter?: () => void
    value?: string
    placeholder?: string
    disabled?: boolean
  }) => (
    <div data-testid="editor-x">
      <textarea
        data-testid="editor-input"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onEscape?.()
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onModEnter?.()
        }}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  ),
}))

async function typeAndSubmit(content: string) {
  fireEvent.input(screen.getByTestId("editor-input"), {
    target: { value: content },
  })
  await userEvent.click(screen.getByText("Create"))
}

describe("MobileCapturePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.search = ""
    mocks.create.mockResolvedValue({ ok: true })
  })

  it("Cancel with a from param goes back in history", async () => {
    mocks.search = "from=dashboard"
    render(<MobileCapturePage />)
    await userEvent.click(screen.getByText("Cancel"))
    expect(mocks.back).toHaveBeenCalledTimes(1)
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("Cancel without a from param falls back to the dashboard", async () => {
    render(<MobileCapturePage />)
    await userEvent.click(screen.getByText("Cancel"))
    expect(mocks.push).toHaveBeenCalledWith("/dashboard")
    expect(mocks.back).not.toHaveBeenCalled()
  })

  it("successful create shows the toast then goes back", async () => {
    mocks.search = "from=mobile"
    render(<MobileCapturePage />)

    await typeAndSubmit("A new idea")

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith("A new idea")
    })
    expect(await screen.findByText("Idea created")).toBeInTheDocument()
    await waitFor(() => {
      expect(mocks.back).toHaveBeenCalledTimes(1)
    }, 3000)
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("failed create keeps the editor open with the content", async () => {
    mocks.search = "from=dashboard"
    mocks.create.mockResolvedValue({ ok: false })
    render(<MobileCapturePage />)

    await typeAndSubmit("Unsaved idea")

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith("Unsaved idea")
    })
    expect(screen.queryByText("Idea created")).toBeNull()
    expect(mocks.back).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText("Cancel"))
    expect(mocks.back).toHaveBeenCalledTimes(1)
  })
})
