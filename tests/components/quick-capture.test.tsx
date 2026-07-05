import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QuickCapture } from "@/components/ideas/quick-capture"

vi.mock("@/components/editor/editor-x", () => ({
  EditorX: ({
    onChange,
    onEscape,
    onModEnter,
    onFocus,
    onBlur,
    value,
    placeholder,
    disabled,
  }: {
    onChange?: (v: string) => void
    onEscape?: () => void
    onModEnter?: () => void
    onFocus?: () => void
    onBlur?: () => void
    value?: string
    placeholder?: string
    disabled?: boolean
  }) => (
    <div data-testid="editor-x">
      <textarea
        data-testid="editor-input"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
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

function findSubmitButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector('button svg.lucide-check')?.closest('button') ?? null
}

function findCancelButton(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector('button svg.lucide-x')?.closest('button') ?? null
}

describe("QuickCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("closed state shows capture button", () => {
    render(<QuickCapture onCapture={vi.fn()} />)
    expect(screen.getByText("Capture a new idea...")).toBeTruthy()
    expect(screen.queryByTestId("editor-x")).toBeNull()
  })

  it("clicking button calls onOpenChange(true)", async () => {
    const onOpenChange = vi.fn()
    render(<QuickCapture onCapture={vi.fn()} onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByText("Capture a new idea..."))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it("open state shows editor when isOpen=true", () => {
    render(<QuickCapture onCapture={vi.fn()} isOpen={true} />)
    expect(screen.getByTestId("editor-x")).toBeTruthy()
  })

  it("submit button is disabled with empty content", () => {
    const { container } = render(<QuickCapture onCapture={vi.fn()} isOpen={true} />)
    const submitButton = findSubmitButton(container)
    expect(submitButton).toBeTruthy()
    expect(submitButton).toBeDisabled()
  })

  it("submit button is enabled with content", async () => {
    const { container } = render(<QuickCapture onCapture={vi.fn()} isOpen={true} />)
    const input = screen.getByTestId("editor-input")
    await userEvent.type(input, "Hello world")
    const submitButton = findSubmitButton(container)
    expect(submitButton).toBeEnabled()
  })

  it("Escape calls onClose", async () => {
    const onClose = vi.fn()
    render(<QuickCapture onCapture={vi.fn()} isOpen={true} onClose={onClose} />)
    const input = screen.getByTestId("editor-input")
    await userEvent.type(input, "{Escape}")
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onCapture on submit via Mod+Enter", async () => {
    const onCapture = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()
    render(
      <QuickCapture
        onCapture={onCapture}
        isOpen={true}
        onOpenChange={onOpenChange}
      />,
    )
    const input = screen.getByTestId("editor-input")

    fireEvent.input(input, { target: { value: "New idea" } })
    fireEvent.keyDown(input, { key: "Enter", metaKey: true })

    await waitFor(() => {
      expect(onCapture).toHaveBeenCalledWith("New idea")
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("cancel button calls onOpenChange(false)", async () => {
    const onOpenChange = vi.fn()
    const { container } = render(
      <QuickCapture onCapture={vi.fn()} isOpen={true} onOpenChange={onOpenChange} />,
    )
    const cancelButton = findCancelButton(container)
    await userEvent.click(cancelButton!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("controlled open/close via isOpen prop", () => {
    const { rerender } = render(<QuickCapture onCapture={vi.fn()} isOpen={false} />)
    expect(screen.queryByTestId("editor-x")).toBeNull()

    rerender(<QuickCapture onCapture={vi.fn()} isOpen={true} />)
    expect(screen.getByTestId("editor-x")).toBeTruthy()
  })

  it("shows keyboard shortcut in closed state", () => {
    render(<QuickCapture onCapture={vi.fn()} />)
    const button = screen.getByText("Capture a new idea...").closest("button")
    expect(button).toBeTruthy()
    const kbd = button!.querySelector("kbd")
    expect(kbd).toBeTruthy()
  })
})
