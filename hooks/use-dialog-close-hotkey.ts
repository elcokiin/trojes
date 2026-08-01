"use client"

import { useHotkeys } from "@tanstack/react-hotkeys"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { SHORTCUTS } from "@/lib/shortcuts"

export function useDialogCloseHotkey(open: boolean | undefined, onClose: () => void) {
  const [keyboardEnabled] = useShortcutPreference("trojes-keyboard-nav")

  useHotkeys(
    SHORTCUTS.closeDialog.hotkeys.map((hotkey) => ({
      hotkey,
      callback: onClose,
      options: { enabled: open && keyboardEnabled },
    })),
    {
      ignoreInputs: true,
      preventDefault: true,
      stopPropagation: true,
    },
  )
}
