"use client"

import { formatForDisplay, type RegisterableHotkey } from "@tanstack/react-hotkeys"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"

function shortcutHotkeyKey(hotkey: RegisterableHotkey) {
  return typeof hotkey === "string" ? hotkey : JSON.stringify(hotkey)
}

interface ShortcutKbdProps {
  hotkey: RegisterableHotkey
  className?: string
}

export function ShortcutKbd({ hotkey, className }: ShortcutKbdProps) {
  const [showShortcutHints] = useShortcutPreference("brainbox-shortcut-hints")

  if (!showShortcutHints) return null

  return <Kbd className={className}>{formatForDisplay(hotkey)}</Kbd>
}

interface ShortcutKbdGroupProps {
  hotkeys: RegisterableHotkey[]
  className?: string
}

export function ShortcutKbdGroup({ hotkeys, className }: ShortcutKbdGroupProps) {
  const [showShortcutHints] = useShortcutPreference("brainbox-shortcut-hints")

  if (!showShortcutHints) return null

  return (
    <KbdGroup className={className}>
      {hotkeys.map((hotkey) => (
        <Kbd key={shortcutHotkeyKey(hotkey)}>{formatForDisplay(hotkey)}</Kbd>
      ))}
    </KbdGroup>
  )
}
