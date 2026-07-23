"use client"

import { useState, useLayoutEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ShortcutKbd } from "@/components/shortcuts/shortcut-kbd"
import { EditorX } from "@/components/editor/editor-x"
import { cn } from "@/lib/utils"
import { Plus, X, Check } from "lucide-react"

import { SHORTCUTS } from "@/lib/shortcuts"

interface QuickCaptureProps {
  onCapture: (content: string) => Promise<void>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

export function QuickCapture({ onCapture, isOpen, onOpenChange, onClose }: QuickCaptureProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openCount, setOpenCount] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  const isExpanded = isOpen ?? false

  const handleOpen = useCallback(() => {
    setContent("")
    setOpenCount((c) => c + 1)
    onOpenChange?.(true)
  }, [onOpenChange])

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
    onClose?.()
  }, [onOpenChange, onClose])

  const handleSubmit = useCallback(async () => {
    const currentContent = content
    if (!currentContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onCapture(currentContent.trim())
    } finally {
      setIsSubmitting(false)
      onOpenChange?.(false)
    }
  }, [content, isSubmitting, onCapture, onOpenChange])

  const handleEscape = useCallback(() => {
    handleClose()
  }, [handleClose])

  const handleModEnter = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  useLayoutEffect(() => {
    if (isExpanded) {
      const el = document.querySelector("[contenteditable]") as HTMLElement | null
      el?.focus()
    }
  }, [isExpanded])

  if (!isExpanded) {
    return (
      <Button
        onClick={handleOpen}
        variant="outline"
        className={cn(
          "w-full h-12 justify-start gap-3 text-muted-foreground font-normal border-dashed bg-card group hover:border-solid transition-all duration-200 max-md:rounded-none max-md:border-x-0",
        )}
      >
        <Plus className="size-4 transition-transform group-hover:scale-110" />
        <span>Capture a new idea...</span>
        <ShortcutKbd hotkey={SHORTCUTS.newIdea.hotkeys[0]} className="ml-auto" />
      </Button>
    )
  }

  return (
    <div
      key={openCount}
      className={cn(
        "relative rounded-md min-h-12 border border-dashed border-input bg-card transition-colors duration-200 hover:border-solid max-md:rounded-none max-md:border-x-0"
      )}
    >
      <EditorX
        value=""
        onChange={setContent}
        onEscape={handleEscape}
        onModEnter={handleModEnter}
        placeholder="What's on your mind? Type **markdown** naturally..."
        disabled={isSubmitting}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          if (!content.trim()) handleClose()
        }}
      />
      <div
        className={cn(
          "absolute bottom-2 right-2 z-10 flex items-center gap-1 transition-all duration-200",
          "backdrop-blur-sm rounded-lg px-2 py-1.5",
          "bg-background/60 border border-border/20 shadow-sm",
          isFocused && content.trim()
            ? "opacity-40 hover:opacity-100"
            : "opacity-0 pointer-events-none"
        )}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClose}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-md p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <X className="size-4" />
          <ShortcutKbd hotkey={SHORTCUTS.cancelCapture.hotkeys[0]} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-md p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Spinner className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
          <ShortcutKbd hotkey={SHORTCUTS.saveCapture.hotkeys[0]} />
        </button>
      </div>
    </div>
  )
}
