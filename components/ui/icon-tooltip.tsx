"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShortcutKbd } from "@/components/shortcuts/shortcut-kbd"
import { cn } from "@/lib/utils"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

interface IconTooltipProps {
  icon: React.ElementType
  label: string
  "aria-label"?: string
  shortcut?: RegisterableHotkey
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  onClick?: () => void
  className?: string
  iconClassName?: string
  size?: "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
  type?: "button" | "submit" | "reset"
}

export function IconTooltip({
  icon: Icon,
  label,
  shortcut,
  "aria-label": ariaLabel,
  side = "left",
  align,
  onClick,
  className,
  iconClassName,
  size = "icon-sm",
  asChild,
  type,
}: IconTooltipProps) {
  if (asChild) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("flex items-center justify-center", className)} onClick={onClick}>
            <Icon className={cn("size-3.5", iconClassName)} />
            <span className="sr-only">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p>{label}</p>
          {shortcut && <ShortcutKbd hotkey={shortcut} />}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          type={type}
          className={className}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          <Icon className={cn("size-3.5", iconClassName)} />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <p>{label}</p>
        {shortcut && <ShortcutKbd hotkey={shortcut} />}
      </TooltipContent>
    </Tooltip>
  )
}
