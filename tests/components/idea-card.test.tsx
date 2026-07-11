import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { IdeaCard } from "@/components/ideas/idea-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Idea } from "@/types/idea"

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
    ...overrides,
  }
  return render(
    <TooltipProvider>
      <IdeaCard {...props} />
    </TooltipProvider>,
  )
}

describe("IdeaCard", () => {
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
})
