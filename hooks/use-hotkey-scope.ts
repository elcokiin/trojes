"use client"

import { useEffect } from "react"
import { useHotkeys } from "@tanstack/react-hotkeys"
import { useUIStore } from "@/stores/ui-store"
import type { UIStore } from "@/stores/ui-store"
import { useThemeToggle } from "@/hooks/use-theme-toggle"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { SHORTCUTS } from "@/lib/shortcuts"

export const selectNoOverlays = (s: UIStore) => s.overlaysOpen === 0
export const selectNoDropdowns = (s: UIStore) => s.dropdownOpen === 0

export function useSuppressGlobalHotkeys(isOpen?: boolean, level: "overlay" | "dropdown" = "overlay") {
  const pushOverlay = useUIStore((s) => s.pushOverlay)
  const popOverlay = useUIStore((s) => s.popOverlay)
  const pushDropdown = useUIStore((s) => s.pushDropdown)
  const popDropdown = useUIStore((s) => s.popDropdown)

  useEffect(() => {
    if (isOpen) {
      if (level === "dropdown") pushDropdown()
      else pushOverlay()
      return () => {
        if (level === "dropdown") popDropdown()
        else popOverlay()
      }
    }
  }, [isOpen, level, pushOverlay, popOverlay, pushDropdown, popDropdown])
}

export function useGlobalHotkeys() {
  const noOverlays = useUIStore(selectNoOverlays)
  const noDropdowns = useUIStore(selectNoDropdowns)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)
  const settingsOpen = useUIStore((s) => s.settingsOpen)
  const togglePinnedTray = useUIStore((s) => s.togglePinnedTray)
  const { toggleTheme, resolvedTheme } = useThemeToggle()
  const [keyboardEnabled] = useShortcutPreference("trojes-keyboard-nav")
  const [settingsKeyEnabled] = useShortcutPreference("trojes-shortcut-settings")
  const [themeToggleKeyEnabled] = useShortcutPreference("trojes-shortcut-theme-toggle")

  useHotkeys([
    {
      hotkey: SHORTCUTS.inbox.hotkeys[0],
      callback: () => setActiveTab("inbox"),
      options: { enabled: keyboardEnabled && noOverlays },
    },
    {
      hotkey: SHORTCUTS.archived.hotkeys[0],
      callback: () => setActiveTab("archived"),
      options: { enabled: keyboardEnabled && noOverlays },
    },
    {
      hotkey: SHORTCUTS.trash.hotkeys[0],
      callback: () => setActiveTab("deleted"),
      options: { enabled: keyboardEnabled && noOverlays },
    },
    {
      hotkey: SHORTCUTS.settings.hotkeys[0],
      callback: () => setSettingsOpen(!settingsOpen),
      options: { enabled: keyboardEnabled && noOverlays && settingsKeyEnabled },
    },
    {
      hotkey: SHORTCUTS.settings.hotkeys[1],
      callback: () => setSettingsOpen(!settingsOpen),
      options: { enabled: keyboardEnabled && noOverlays && settingsKeyEnabled },
    },
    {
      hotkey: SHORTCUTS.toggleTheme.hotkeys[0],
      callback: () => { if (resolvedTheme) toggleTheme() },
      options: { enabled: themeToggleKeyEnabled && noDropdowns },
    },
    {
      hotkey: SHORTCUTS.togglePinnedTray.hotkeys[0],
      callback: () => togglePinnedTray(),
      options: { enabled: noOverlays },
    },
  ], {
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })
}
