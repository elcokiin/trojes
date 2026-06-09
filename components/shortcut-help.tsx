"use client"

import { useState } from "react"
import { formatForDisplay, useHeldKeys, useHotkey, useKeyHold } from "@tanstack/react-hotkeys"
import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { SHORTCUT_GROUPS, SHORTCUTS, type ShortcutDefinition } from "@/lib/shortcuts"
import { cn } from "@/lib/utils"

function ShortcutKeys({ hotkeys }: { hotkeys: ShortcutDefinition["hotkeys"] }) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {hotkeys.map((hotkey) => (
        <Kbd key={hotkey}>{formatForDisplay(hotkey)}</Kbd>
      ))}
    </div>
  )
}

export function ShortcutHelp() {
  const [open, setOpen] = useState(false)
  const heldKeys = useHeldKeys()
  const shiftHeld = useKeyHold("Shift")
  const shortcuts = Object.values(SHORTCUTS)

  useHotkey(SHORTCUTS.help.hotkeys[0], () => setOpen(true), {
    ignoreInputs: true,
    preventDefault: true,
  })

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 gap-2 bg-background/95 shadow-sm backdrop-blur"
      >
        <Keyboard className="size-4" />
        <span className="hidden sm:inline">Shortcuts</span>
        <Kbd>{formatForDisplay(SHORTCUTS.help.hotkeys[0])}</Kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-[620px]">
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
                        <ShortcutKeys hotkeys={shortcut.hotkeys} />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
