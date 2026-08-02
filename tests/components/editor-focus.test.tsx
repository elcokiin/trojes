import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MobileEditor } from "@/components/editor/mobile-editor"

vi.mock("@/hooks/use-hotkey-scope", () => ({
  useSuppressGlobalHotkeys: vi.fn(),
}))

describe("MobileEditor focus (real EditorX)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("focuses the contenteditable on mount", async () => {
    render(<MobileEditor onCapture={vi.fn()} onClose={vi.fn()} />)
    const editable = await screen.findByRole("textbox")
    await waitFor(() => {
      expect(editable).toHaveFocus()
    }, { timeout: 2000 })
  })

  it("focuses the editor when clicking the container area", async () => {
    render(<MobileEditor onCapture={vi.fn()} onClose={vi.fn()} />)
    const editable = await screen.findByRole("textbox")

    // blur it first to simulate an empty area click
    editable.blur()
    expect(editable).not.toHaveFocus()

    // find the container div (flex-1 flex flex-col min-h-0)
    const container = editable.closest(".min-h-0")
    expect(container).not.toBeNull()

    fireEvent.click(container!)
    await waitFor(() => {
      expect(editable).toHaveFocus()
    })
  })
})
