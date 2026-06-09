"use client"

import { useState, useRef, useEffect } from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ShortcutKbd } from "@/components/shortcut-kbd"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isExpanded = isOpen ?? false

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onCapture(content.trim())
      setContent("")
      onOpenChange?.(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange?.(false)
    onClose?.()
    setContent("")
  }

  useHotkey(SHORTCUTS.saveCapture.hotkeys[0], () => handleSubmit(), {
    enabled: isExpanded,
    target: textareaRef,
    ignoreInputs: false,
    preventDefault: true,
  })

  useHotkey(SHORTCUTS.cancelCapture.hotkeys[0], () => handleClose(), {
    enabled: isExpanded,
    target: textareaRef,
    ignoreInputs: false,
    preventDefault: true,
  })

  if (!isExpanded) {
    return (
      <Button
        onClick={() => onOpenChange?.(true)}
        className="w-full h-12 justify-start gap-3 text-muted-foreground font-normal border-dashed"
        variant="outline"
      >
        <Plus className="size-4" />
        <span>Capture a new idea...</span>
        <ShortcutKbd hotkey={SHORTCUTS.newIdea.hotkeys[0]} className="ml-auto" />
      </Button>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShortcutKbd hotkey={SHORTCUTS.cancelCapture.hotkeys[0]} /> cancel
            <span className="mx-1">/</span>
            <ShortcutKbd hotkey={SHORTCUTS.saveCapture.hotkeys[0]} /> save
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
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
