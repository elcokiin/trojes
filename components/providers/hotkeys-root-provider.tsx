"use client"

import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys"
import { useThemeToggle } from "@/hooks/use-theme-toggle"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { SHORTCUTS } from "@/lib/shortcuts"

function GlobalThemeShortcut() {
  const { toggleTheme, resolvedTheme } = useThemeToggle()
  const [themeToggleKeyEnabled] = useShortcutPreference("trojes-shortcut-theme-toggle")

  useHotkey(SHORTCUTS.toggleTheme.hotkeys[0], () => {
    if (!resolvedTheme) return
    toggleTheme()
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
