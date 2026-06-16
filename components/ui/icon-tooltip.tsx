"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShortcutKbd } from "@/components/shortcuts/shortcut-kbd"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

interface IconTooltipProps {
  icon: React.ReactNode
  label: string
  "aria-label"?: string
  shortcut?: RegisterableHotkey
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  onClick?: () => void
  className?: string
  size?: "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
  type?: "button" | "submit" | "reset"
}

export function IconTooltip({
  icon,
  label,
  shortcut,
  "aria-label": ariaLabel,
  side = "left",
  align,
  onClick,
  className,
  size = "icon-sm",
  asChild,
  type,
}: IconTooltipProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    if (asChild) {
      return (
        <span className={cn("flex items-center justify-center", className)} onClick={onClick}>
          {icon}
          <span className="sr-only">{label}</span>
        </span>
      )
    }

    return (
      <Button
        variant="ghost"
        size={size}
        type={type}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </Button>
    )
  }

  if (asChild) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("flex items-center justify-center", className)} onClick={onClick}>
            {icon}
            <span className="sr-only">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="flex items-center gap-1.5">
          <span>{label}</span>
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
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className="flex items-center gap-1.5">
        <span>{label}</span>
        {shortcut && <ShortcutKbd hotkey={shortcut} />}
      </TooltipContent>
    </Tooltip>
  )
}
