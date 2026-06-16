"use client"

import { formatForDisplay, type RegisterableHotkey } from "@tanstack/react-hotkeys"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { useIsMobile } from "@/hooks/use-mobile"

function shortcutHotkeyKey(hotkey: RegisterableHotkey) {
  return typeof hotkey === "string" ? hotkey : JSON.stringify(hotkey)
}

interface ShortcutKbdProps {
  hotkey: RegisterableHotkey
  className?: string
  alwaysVisible?: boolean
}

export function ShortcutKbd({ hotkey, className, alwaysVisible = false }: ShortcutKbdProps) {
  const isMobile = useIsMobile()
  const [showShortcutHints] = useShortcutPreference("troje-shortcut-hints")

  if (isMobile) return null
  if (!alwaysVisible && !showShortcutHints) return null

  return <Kbd className={className}>{formatForDisplay(hotkey)}</Kbd>
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
  const isMobile = useIsMobile()
  const [showShortcutHints] = useShortcutPreference("troje-shortcut-hints")

  if (isMobile) return null
  if (!alwaysVisible && !showShortcutHints) return null

  return (
    <KbdGroup className={className}>
      {hotkeys.map((hotkey) => (
        <Kbd key={shortcutHotkeyKey(hotkey)}>{formatForDisplay(hotkey)}</Kbd>
      ))}
    </KbdGroup>
  )
}
