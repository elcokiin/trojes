import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MobileEditor } from "@/components/editor/mobile-editor"

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

vi.mock("@/hooks/use-hotkey-scope", () => ({
  useSuppressGlobalHotkeys: vi.fn(),
}))

describe("MobileEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("edit mode: renders initial content and Save button", () => {
    render(
      <MobileEditor
        initialContent="Original idea"
        onCapture={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByTestId("editor-input")).toHaveValue("Original idea")
    expect(screen.getByText("Save")).toBeTruthy()
    expect(screen.queryByText("Create")).toBeNull()
  })

  it("edit mode: saving calls onCapture with edited content and closes", async () => {
    const onCapture = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(
      <MobileEditor
        initialContent="Original idea"
        onCapture={onCapture}
        onClose={onClose}
      />,
    )
    const input = screen.getByTestId("editor-input")
    fireEvent.input(input, { target: { value: "Edited idea" } })
    await userEvent.click(screen.getByText("Save"))
    await waitFor(() => {
      expect(onCapture).toHaveBeenCalledWith("Edited idea")
    })
    expect(onClose).toHaveBeenCalled()
  })

  it("edit mode: Escape closes", async () => {
    const onClose = vi.fn()
    render(
      <MobileEditor
        initialContent="Original idea"
        onCapture={vi.fn()}
        onClose={onClose}
      />,
    )
    const input = screen.getByTestId("editor-input")
    await userEvent.type(input, "{Escape}")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("create mode: shows Create button", () => {
    render(<MobileEditor onCapture={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText("Create")).toBeTruthy()
    expect(screen.queryByText("Save")).toBeNull()
  })

  it("create mode: Escape does not close when content typed", async () => {
    const onClose = vi.fn()
    render(<MobileEditor onCapture={vi.fn()} onClose={onClose} />)
    const input = screen.getByTestId("editor-input")
    fireEvent.input(input, { target: { value: "typed content" } })
    fireEvent.keyDown(input, { key: "Escape" })
    expect(onClose).not.toHaveBeenCalled()
  })
})