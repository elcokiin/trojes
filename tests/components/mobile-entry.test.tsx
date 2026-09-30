import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MobileCaptureEntry } from "@/components/app/mobile-entry"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  prefetch: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    prefetch: mocks.prefetch,
    back: vi.fn(),
  }),
}))

describe("MobileCaptureEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("Write tile navigates to the capture page", async () => {
    render(<MobileCaptureEntry />)
    await userEvent.click(screen.getByRole("button", { name: "Write" }))
    expect(mocks.push).toHaveBeenCalledWith("/mobile/capture?from=mobile")
  })

  it("renders the entry tiles without an inline editor", () => {
    render(<MobileCaptureEntry />)
    expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Record" })).toBeInTheDocument()
    expect(screen.queryByTestId("editor-input")).toBeNull()
  })

  it("Record tile opens the coming-soon dialog", async () => {
    render(<MobileCaptureEntry />)
    await userEvent.click(screen.getByRole("button", { name: "Record" }))
    expect(
      await screen.findByText("This feature will be available soon."),
    ).toBeInTheDocument()
    expect(mocks.push).not.toHaveBeenCalled()
  })
})
