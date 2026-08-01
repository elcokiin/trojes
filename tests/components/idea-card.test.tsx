import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { IdeaCard } from "@/components/ideas/idea-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Idea } from "@/types/idea"

const mockUseIsMobile = vi.fn()
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

vi.mock("@/components/editor/mobile-editor", () => ({
  MobileEditor: ({
    initialContent,
    onCapture,
    onClose,
  }: {
    initialContent?: string
    onCapture?: (content: string) => void
    onClose?: () => void
  }) => (
    <div data-testid="mobile-editor">
      <span data-testid="mobile-editor-content">{initialContent}</span>
      <button type="button" onClick={() => onCapture?.("saved content")}>
        save
      </button>
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}))

const baseIdea: Idea = {
  id: "idea-1",
  content: "# Hello\nThis is **bold** and `code`.",
  source: "web",
  status: "inbox",
  tags: ["test", "markdown"],
  pinned: false,
  background_color: null,
  created_at: "2024-06-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
  deleted_at: null,
}

function renderCard(overrides: Partial<Parameters<typeof IdeaCard>[0]> = {}) {
  const props = {
    idea: baseIdea,
    onStatusChange: vi.fn(),
    onPinChange: vi.fn(),
    onColorChange: vi.fn(),
    onContentChange: vi.fn(),
    ...overrides,
  }
  return render(
    <TooltipProvider>
      <IdeaCard {...props} />
    </TooltipProvider>,
  )
}

describe("IdeaCard", () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false)
  })

  it("renders markdown content: heading", () => {
    renderCard()
    expect(screen.getByText("Hello")).toBeTruthy()
  })

  it("renders markdown content: bold text", () => {
    renderCard()
    expect(screen.getByText("bold")).toBeTruthy()
  })

  it("renders tags", () => {
    renderCard()
    expect(screen.getByText("test")).toBeTruthy()
    expect(screen.getByText("markdown")).toBeTruthy()
  })

  it("pin icon calls onPinChange when clicked", async () => {
    const onPinChange = vi.fn()
    renderCard({ onPinChange })
    const pinButton = screen.getByText("Pin to top").closest("button")
    expect(pinButton).toBeTruthy()
    await userEvent.click(pinButton!)
    expect(onPinChange).toHaveBeenCalledWith("idea-1", true)
  })

  it("pin icon shows Unpin label when already pinned", () => {
    renderCard({ idea: { ...baseIdea, pinned: true } })
    expect(screen.getByText("Unpin")).toBeTruthy()
  })

  it("copy button copies content to clipboard", async () => {
    const writeText = vi.fn()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    })
    renderCard()
    const copyButton = screen.getByText("Copy text").closest("button")
    expect(copyButton).toBeTruthy()
    await userEvent.click(copyButton!)
    expect(writeText).toHaveBeenCalledWith(baseIdea.content)
  })

  it("selected state applies ring classes", () => {
    const { container } = renderCard({ isSelected: true })
    const card = container.querySelector("[class*='ring-2']")
    expect(card).toBeTruthy()
  })

  it("non-selected state does not have ring", () => {
    const { container } = renderCard({ isSelected: false })
    const card = container.querySelector("[class*='ring-2']")
    expect(card).toBeNull()
  })

  it("shows relative date", () => {
    renderCard()
    expect(screen.getByText(/Jun 1/)).toBeTruthy()
  })

  it("does not show pin button when status is archived", () => {
    renderCard({ idea: { ...baseIdea, status: "archived" } })
    expect(screen.queryByText("Pin to top")).toBeNull()
    expect(screen.queryByText("Unpin")).toBeNull()
  })

  it("does not show pin button when status is deleted", () => {
    renderCard({ idea: { ...baseIdea, status: "deleted" } })
    expect(screen.queryByText("Pin to top")).toBeNull()
    expect(screen.queryByText("Unpin")).toBeNull()
  })

  it("mobile: Edit menu item opens MobileEditor with card content", async () => {
    mockUseIsMobile.mockReturnValue(true)
    renderCard()

    const moreButton = screen.getByText("More actions").closest("button")
    expect(moreButton).toBeTruthy()
    await userEvent.click(moreButton!)

    await userEvent.click(screen.getByText("Edit"))

    expect(screen.getByTestId("mobile-editor")).toBeTruthy()
    expect(screen.getByTestId("mobile-editor-content")).toHaveTextContent(
      baseIdea.content.replace(/\s+/g, " "),
    )
  })

  it("mobile: saving from MobileEditor calls onContentChange", async () => {
    mockUseIsMobile.mockReturnValue(true)
    const onContentChange = vi.fn()
    renderCard({ onContentChange })

    const moreButton = screen.getByText("More actions").closest("button")
    await userEvent.click(moreButton!)
    await userEvent.click(screen.getByText("Edit"))

    await userEvent.click(screen.getByText("save"))
    expect(onContentChange).toHaveBeenCalledWith("idea-1", "saved content")
  })

  it("desktop: Edit menu item does not open MobileEditor", async () => {
    mockUseIsMobile.mockReturnValue(false)
    renderCard()

    const moreButton = screen.getByText("More actions").closest("button")
    await userEvent.click(moreButton!)
    await userEvent.click(screen.getByText("Edit"))

    expect(screen.queryByTestId("mobile-editor")).toBeNull()
  })
})
