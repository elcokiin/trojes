"use client"

import { useState, useCallback, useRef } from "react"
import { EditorX, type EditorXHandle } from "@/components/editor/editor-x"
import { Spinner } from "@/components/ui/spinner"
import { useSuppressGlobalHotkeys } from "@/hooks/use-hotkey-scope"

interface MobileEditorProps {
  onCapture: (content: string) => Promise<void>
  onClose: () => void
  overlay?: boolean
  /** When provided, the editor starts with this content and acts as an edit form. */
  initialContent?: string
}

export function MobileEditor({ onCapture, onClose, overlay = true, initialContent }: MobileEditorProps) {
  const isEdit = initialContent !== undefined
  const [content, setContent] = useState(initialContent ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const editorRef = useRef<EditorXHandle>(null)

  useSuppressGlobalHotkeys(true)

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
    // In edit mode the original content is safe on the card, so Escape always
    // closes. In create mode, only close when nothing was typed.
    if (isEdit || !content.trim()) {
      onClose()
    }
  }, [content, onClose, isEdit])

  const handleModEnter = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  const editor = (
    <>
      <div
        className="flex-1 flex flex-col min-h-0 cursor-text"
        onClick={(e) => {
          // Don't steal focus from interactive elements such as the floating
          // link editor input or toolbar buttons.
          const target = e.target as HTMLElement
          if (target.closest("input, button, a, [contenteditable='false']")) return
          editorRef.current?.focus()
        }}
      >
        <EditorX
          ref={editorRef}
          value={initialContent ?? ""}
          onChange={setContent}
          onEscape={handleEscape}
          onModEnter={handleModEnter}
          placeholder="What's on your mind?..."
          className="flex-1"
          minHeight="30dvh"
          focusOnMount
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
          {isSubmitting ? <Spinner className="size-4 mx-auto" /> : isEdit ? "Save" : "Create"}
        </button>
      </div>
    </>
  )

  if (!overlay) return editor

  return (
    <div className="fixed top-0 left-0 right-0 h-dvh z-50 bg-background flex flex-col">
      {editor}
    </div>
  )
}
