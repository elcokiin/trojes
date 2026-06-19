"use client"

import { useHotkey } from "@tanstack/react-hotkeys"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { SHORTCUTS } from "@/lib/shortcuts"

export function useDialogCloseHotkey(open: boolean, onClose: () => void) {
  const [keyboardEnabled] = useShortcutPreference("troje-keyboard-nav")

  useHotkey(SHORTCUTS.closeDialog.hotkeys[0], onClose, {
    enabled: open && keyboardEnabled,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })
}
