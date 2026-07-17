"use client"

import { useState, useCallback, useEffect } from "react"
import { EditorX } from "@/components/editor/editor-x"
import { Spinner } from "@/components/ui/spinner"

interface MobileEditorProps {
  onCapture: (content: string) => Promise<void>
  onClose: () => void
}

export function MobileEditor({ onCapture, onClose }: MobileEditorProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      const el = document.querySelector("[contenteditable]") as HTMLElement | null
      el?.focus()
    }, 50)
    return () => clearTimeout(id)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onCapture(content.trim())
    } finally {
      setIsSubmitting(false)
      onClose()
    }
  }, [content, isSubmitting, onCapture, onClose])

  const handleEscape = useCallback(() => {
    if (!content.trim()) {
      onClose()
    }
  }, [content, onClose])

  const handleModEnter = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  return (
    <div className="fixed top-0 left-0 right-0 h-dvh z-50 bg-background flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <EditorX
          value=""
          onChange={setContent}
          onEscape={handleEscape}
          onModEnter={handleModEnter}
          placeholder="What's on your mind?..."
          className="flex-1"
          minHeight="30dvh"
        />
      </div>

      <div className="grid grid-cols-2 border-t border-border shrink-0 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={onClose}
          className="h-12 bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/20 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="h-12 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? <Spinner className="size-4 mx-auto" /> : "Create"}
        </button>
      </div>
    </div>
  )
}
