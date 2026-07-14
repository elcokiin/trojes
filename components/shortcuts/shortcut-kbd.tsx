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
  alwaysVisible?: boolean
}

export function ShortcutKbd({ hotkey, className, alwaysVisible = false }: ShortcutKbdProps) {
  const [showShortcutHints] = useShortcutPreference("trojes-shortcut-hints")

  if (!alwaysVisible && !showShortcutHints) return null

  return <Kbd className={`max-md:hidden ${className ?? ""}`}>{formatForDisplay(hotkey)}</Kbd>
}

interface ShortcutKbdGroupProps {
  hotkeys: RegisterableHotkey[]
  className?: string
  alwaysVisible?: boolean
}

export function ShortcutKbdGroup({
  hotkeys,
  className,
  alwaysVisible = false,
}: ShortcutKbdGroupProps) {
  const [showShortcutHints] = useShortcutPreference("trojes-shortcut-hints")

  if (!alwaysVisible && !showShortcutHints) return null

  return (
    <KbdGroup className={`max-md:hidden ${className ?? ""}`}>
      {hotkeys.map((hotkey) => (
        <Kbd key={shortcutHotkeyKey(hotkey)}>{formatForDisplay(hotkey)}</Kbd>
      ))}
    </KbdGroup>
  )
}
