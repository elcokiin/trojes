"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ShortcutKbd } from "@/components/shortcuts/shortcut-kbd"
import { EditorX } from "@/components/editor/editor-x"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Plus, Send } from "lucide-react"
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
  const contentRef = useRef(content)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => { contentRef.current = content }, [content])

  const isMobile = useIsMobile()
  const isExpanded = isOpen ?? false

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        (editorRef.current?.querySelector("[contenteditable]") as HTMLElement)?.focus()
      }, 0)
    }
  }, [isExpanded])

  const handleSubmit = useCallback(async () => {
    const currentContent = contentRef.current
    if (!currentContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onCapture(currentContent.trim())
      setContent("")
      onOpenChange?.(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, onCapture, onOpenChange])

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
    onClose?.()
    setContent("")
  }, [onOpenChange, onClose])

  if (!isExpanded) {
    return (
      <Button
        onClick={() => onOpenChange?.(true)}
        variant="outline"
        className={cn(
          "w-full h-12 justify-start gap-3 text-muted-foreground font-normal border-dashed bg-card group hover:border-solid transition-all duration-200",
          isMobile && "rounded-none border-x-0",
        )}
      >
        <Plus className="size-4 transition-transform group-hover:scale-110" />
        <span>Capture a new idea...</span>
        <ShortcutKbd hotkey={SHORTCUTS.newIdea.hotkeys[0]} className="ml-auto" />
      </Button>
    )
  }

  return (
    <Card className={cn("p-0 overflow-hidden", isMobile && "rounded-none border-x-0")}>
      <div className="flex flex-col">
        <div ref={editorRef}>
          <EditorX
            value={content}
            onChange={setContent}
            placeholder="What's on your mind? Type **markdown** naturally..."
            minHeight="120px"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5">
          <div className="flex items-center gap-2">
            {!isMobile && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ShortcutKbd hotkey={SHORTCUTS.cancelCapture.hotkeys[0]} /> cancel
                <span className="mx-1">/</span>
                <ShortcutKbd hotkey={SHORTCUTS.saveCapture.hotkeys[0]} /> save
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-2", isMobile && "ml-auto")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
