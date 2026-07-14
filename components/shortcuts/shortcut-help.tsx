"use client"

import { useState } from "react"
import { useHeldKeys, useHotkey, useKeyHold } from "@tanstack/react-hotkeys"
import { useRegisterHotkeyScope, selectNoOverlays } from "@/hooks/use-hotkey-scope"
import { useUIStore } from "@/stores/ui-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShortcutKbdGroup } from "@/components/shortcuts/shortcut-kbd"
import { useDialogCloseHotkey } from "@/hooks/use-dialog-close-hotkey"
import { SHORTCUT_GROUPS, SHORTCUTS } from "@/lib/shortcuts"
import { cn } from "@/lib/utils"

export function ShortcutHelp() {
  const [open, setOpen] = useState(false)
  useRegisterHotkeyScope(open)
  const noOverlays = useUIStore(selectNoOverlays)
  const heldKeys = useHeldKeys()
  const shiftHeld = useKeyHold("Shift")
  const shortcuts = Object.values(SHORTCUTS)

  useHotkey(SHORTCUTS.help.hotkeys[0], () => setOpen(true), {
    enabled: noOverlays,
    ignoreInputs: true,
    preventDefault: true,
  })

  useDialogCloseHotkey(open, () => setOpen(false))

  return (
    <div className="max-md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-[620px] grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Platform-aware shortcuts for capture, navigation, views, and system actions.
          </DialogDescription>
        </DialogHeader>

        <div className="themed-scrollbar min-h-0 space-y-5 overflow-y-auto pr-2">
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Held keys</span>
            <span
              className={cn(
                "font-mono text-xs",
                shiftHeld ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {heldKeys.length > 0 ? heldKeys.join(" + ") : "None"}
            </span>
          </div>

          {SHORTCUT_GROUPS.map((group) => {
            const groupShortcuts = shortcuts.filter((shortcut) => shortcut.category === group)
            if (groupShortcuts.length === 0) return null

            return (
              <section key={group} className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group}
                </h3>
                <div className="divide-y rounded-md border">
                  {groupShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-sm"
                    >
                      <span>{shortcut.label}</span>
                      <ShortcutKbdGroup hotkeys={shortcut.hotkeys} className="flex-wrap justify-end" />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}
