import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { withNuqsTestingAdapter } from "nuqs/adapters/testing"
import { SettingsDialog } from "@/components/settings/settings-dialog"

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

vi.mock("@/stores/ui-store", () => ({
  useUIStore: (selector?: (s: Record<string, unknown>) => unknown) =>
    selector ? selector({ overlaysOpen: 0, dropdownOpen: 0 }) : {},
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

vi.mock("@/components/ui/icon-tooltip", () => ({
  IconTooltip: ({ label, onClick }: { label?: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick} aria-label={label}>
      {label}
    </button>
  ),
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

describe("SettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMatchMedia({})
  })

  it("shows API Keys section when ?settings=api is in the URL", () => {
    render(
      <SettingsDialog open={true} onOpenChange={vi.fn()} user={user} />,
      { wrapper: withNuqsTestingAdapter({ searchParams: "?settings=api" }) },
    )
    expect(screen.getByTestId("api-keys-manager")).toBeTruthy()
  })

  it("shows Install section on mobile when app is not installed", async () => {
    mockMatchMedia({
      "(max-width: 767px)": true,
      "(display-mode: standalone)": false,
    })

    render(
      <SettingsDialog open={true} onOpenChange={vi.fn()} user={user} />,
      { wrapper: withNuqsTestingAdapter({ searchParams: "?settings=install" }) },
    )

    await waitFor(() => {
      expect(screen.getByTestId("pwa-install-manager")).toBeTruthy()
    })
  })

  it("shows API Keys on mobile when app is installed", async () => {
    mockMatchMedia({
      "(max-width: 767px)": true,
      "(display-mode: standalone)": true,
    })

    render(
      <SettingsDialog open={true} onOpenChange={vi.fn()} user={user} />,
      { wrapper: withNuqsTestingAdapter({ searchParams: "?settings=api" }) },
    )

    await waitFor(() => {
      expect(screen.getByTestId("api-keys-manager")).toBeTruthy()
    })
    expect(screen.queryByTestId("pwa-install-manager")).toBeNull()
  })

  it("respects ?settings=appearance URL param", () => {
    render(
      <SettingsDialog open={true} onOpenChange={vi.fn()} user={user} />,
      { wrapper: withNuqsTestingAdapter({ searchParams: "?settings=appearance" }) },
    )
    const themeElements = screen.getAllByText("Theme")
    expect(themeElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByTestId("api-keys-manager")).toBeNull()
  })

  it("respects ?settings=install URL param on mobile", async () => {
    mockMatchMedia({
      "(max-width: 767px)": true,
      "(display-mode: standalone)": false,
    })

    render(
      <SettingsDialog open={true} onOpenChange={vi.fn()} user={user} />,
      { wrapper: withNuqsTestingAdapter({ searchParams: "?settings=install" }) },
    )

    await waitFor(() => {
      expect(screen.getByTestId("pwa-install-manager")).toBeTruthy()
    })
  })

  it("dialog is closed when no ?settings param is present", () => {
    const { container } = render(
      <SettingsDialog open={false} onOpenChange={vi.fn()} user={user} />,
      { wrapper: withNuqsTestingAdapter() },
    )
    expect(container.textContent).toBe("")
  })
})
