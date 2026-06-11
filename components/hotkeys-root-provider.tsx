"use client"

import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys"
import { useTheme } from "@/components/theme-provider"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { SHORTCUTS } from "@/lib/shortcuts"

function GlobalThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme()
  const [themeToggleKeyEnabled] = useShortcutPreference("troje-shortcut-theme-toggle")

  useHotkey(SHORTCUTS.toggleTheme.hotkeys[0], () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, {
    enabled: themeToggleKeyEnabled,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  return null
}

export function HotkeysRootProvider({ children }: { children: React.ReactNode }) {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: {
          ignoreInputs: true,
          preventDefault: true,
          stopPropagation: true,
        },
        hotkeySequence: {
          ignoreInputs: true,
          preventDefault: true,
          stopPropagation: true,
          timeout: 1200,
        },
      }}
    >
      <GlobalThemeShortcut />
      {children}
    </HotkeysProvider>
  )
}
