"use client"

import { XIcon } from "lucide-react"
import { IconTooltip } from "@/components/ui/custom/icon-tooltip"
import { SHORTCUTS } from "@/lib/shortcuts"
import { cn } from "@/lib/utils"

interface DialogCloseButtonProps {
  onClick: () => void
  className?: string
}

/**
 * Standard close [x] button for dialogs, with a tooltip showing the
 * "Close dialog" shortcut. Positioned in the top-right corner by default.
 */
export function DialogCloseButton({ onClick, className }: DialogCloseButtonProps) {
  return (
    <IconTooltip
      icon={<XIcon />}
      label="Close dialog"
      shortcut={SHORTCUTS.closeDialog.hotkeys[0]}
      side="bottom"
      className={cn("absolute top-4 right-4 z-10", className)}
      onClick={onClick}
    />
  )
}