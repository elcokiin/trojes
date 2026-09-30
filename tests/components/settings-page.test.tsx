import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { withNuqsTestingAdapter } from "nuqs/adapters/testing"
import { SettingsPage } from "@/components/settings/settings-page"

const { routerMock } = vi.hoisted(() => ({
  routerMock: { back: vi.fn(), push: vi.fn(), replace: vi.fn() },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}))

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}))

vi.mock("@tanstack/react-hotkeys", () => ({
  useHotkey: vi.fn(),
  useHotkeys: vi.fn(),
}))

vi.mock("@/hooks/use-hotkey-scope", () => ({
  useSuppressGlobalHotkeys: vi.fn(),
  selectNoDropdowns: () => true,
}))

vi.mock("@/hooks/use-dialog-close-hotkey", () => ({
  useDialogCloseHotkey: vi.fn(),
}))

vi.mock("@/hooks/use-shortcut-preferences", () => ({
  useShortcutPreference: () => [false, vi.fn()] as const,
}))

vi.mock("@/lib/offline-identity", () => ({
  clearCachedUserId: vi.fn(),
}))

vi.mock("@/components/providers/theme-provider", () => ({
  useTheme: () => ({
    theme: "system",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
  }),
}))

vi.mock("@/components/settings/api-keys-manager", () => ({
  ApiKeysManager: () => <div data-testid="api-keys-manager">API Keys</div>,
}))

vi.mock("@/components/settings/pwa-install-manager", () => ({
  PwaInstallManager: () => <div data-testid="pwa-install-manager">Install</div>,
}))

vi.mock("@/components/settings/settings-keyboard", () => ({
  SettingsKeyboard: () => <div data-testid="settings-keyboard">Keyboard</div>,
}))

vi.mock("@/components/settings/settings-appearance", () => ({
  SettingsAppearance: () => <div data-testid="settings-appearance">Theme</div>,
}))

const user = { name: "Test User", email: "test@example.com", image: null }

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

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMatchMedia({})
  })

  it("falls back to the API section when no ?section param is present", () => {
    render(<SettingsPage user={user} />, {
      wrapper: withNuqsTestingAdapter(),
    })
    expect(screen.getByTestId("api-keys-manager")).toBeTruthy()
  })

  it("renders the section from ?section=", () => {
    render(<SettingsPage user={user} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?section=appearance" }),
    })
    expect(screen.getByTestId("settings-appearance")).toBeTruthy()
    expect(screen.queryByTestId("api-keys-manager")).toBeNull()
  })

  it("shows the Install section on mobile when the app is not installed", async () => {
    mockMatchMedia({
      "(max-width: 767px)": true,
      "(display-mode: standalone)": false,
    })

    render(<SettingsPage user={user} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?section=install" }),
    })

    await waitFor(() => {
      expect(screen.getByTestId("pwa-install-manager")).toBeTruthy()
    })
  })

  it("navigates to the dashboard from the back button when there is no history", async () => {
    render(<SettingsPage user={user} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?section=api" }),
    })

    fireEvent.click(screen.getByRole("button", { name: "Go back" }))

    expect(routerMock.push).toHaveBeenCalledWith("/dashboard")
    expect(routerMock.back).not.toHaveBeenCalled()
  })
})
