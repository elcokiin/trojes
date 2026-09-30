import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { withNuqsTestingAdapter } from "nuqs/adapters/testing"
import { useMobileSettingsRoute } from "@/hooks/use-mobile-settings-route"
import { useUIStore } from "@/stores/ui-store"

const { routerMock } = vi.hoisted(() => ({
  routerMock: { back: vi.fn(), push: vi.fn(), replace: vi.fn() },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}))

function mockMatchMedia(overrides: Record<string, boolean>) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: overrides[query] ?? false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function Harness() {
  useMobileSettingsRoute()
  return null
}

describe("useMobileSettingsRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({ settingsOpen: false })
    mockMatchMedia({})
  })

  it("redirects a ?settings= deep link to /settings on mobile", async () => {
    mockMatchMedia({ "(max-width: 767px)": true })

    render(<Harness />, {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?settings=appearance",
      }),
    })

    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith(
        "/settings?section=appearance",
      )
    })
  })

  it("redirects when the settings flag is set on mobile and resets it", async () => {
    mockMatchMedia({ "(max-width: 767px)": true })
    useUIStore.setState({ settingsOpen: true })

    render(<Harness />, { wrapper: withNuqsTestingAdapter() })

    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith(
        "/settings?section=api",
      )
    })
    expect(useUIStore.getState().settingsOpen).toBe(false)
  })

  it("does nothing on desktop", () => {
    render(<Harness />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?settings=api" }),
    })

    expect(routerMock.replace).not.toHaveBeenCalled()
    expect(useUIStore.getState().settingsOpen).toBe(false)
  })

  it("does nothing on mobile when settings are not requested", () => {
    mockMatchMedia({ "(max-width: 767px)": true })

    render(<Harness />, { wrapper: withNuqsTestingAdapter() })

    expect(routerMock.replace).not.toHaveBeenCalled()
  })
})
