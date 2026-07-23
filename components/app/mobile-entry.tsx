"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Keyboard, Mic, ChevronUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { MobileHeader } from "@/components/app/mobile-header"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ideasApi } from "@/lib/api-client"
import { revalidateAllIdeas } from "@/lib/swr-helpers"

const EditorX = dynamic(
  () => import("@/components/editor/editor-x").then((m) => ({ default: m.EditorX })),
  {
    loading: () => (
      <div className="flex-1 flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    ),
  },
)

const DASHBOARD_HREF = "/dashboard"

export function MobileCaptureEntry() {
  const router = useRouter()
  const [showEditor, setShowEditor] = useState(false)
  const [showMicDialog, setShowMicDialog] = useState(false)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSwipingUp, setIsSwipingUp] = useState(false)
  const [showCreatedToast, setShowCreatedToast] = useState(false)
  const prefetched = useRef(false)

  const touchStartY = useRef(0)

  useEffect(() => {
    if (!showCreatedToast) return
    const timer = setTimeout(() => setShowCreatedToast(false), 2000)
    return () => clearTimeout(timer)
  }, [showCreatedToast])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    setIsSwipingUp(false)
    if (!prefetched.current) {
      prefetched.current = true
      router.prefetch(DASHBOARD_HREF)
    }
  }, [router])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current
    setIsSwipingUp(deltaY < -15)
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      setIsSwipingUp(false)
      const deltaY = e.changedTouches[0].clientY - touchStartY.current
      if (deltaY < -50) {
        router.push(DASHBOARD_HREF)
      }
    },
    [router],
  )

  const handleOpenEditor = useCallback(() => {
    setShowEditor(true)
  }, [])

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false)
    setContent("")
  }, [])

  const handleCapture = useCallback(async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const response = await ideasApi.create(content.trim())
      if (response.ok) {
        revalidateAllIdeas()
        setShowCreatedToast(true)
      }
    } finally {
      setIsSubmitting(false)
      setShowEditor(false)
      setContent("")
    }
  }, [content, isSubmitting])

  const handleEscape = useCallback(() => {
    if (!content.trim()) handleCloseEditor()
  }, [content, handleCloseEditor])

  const handleModEnter = useCallback(() => {
    handleCapture()
  }, [handleCapture])

  return (
    <div className="flex flex-col h-dvh bg-background" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <MobileHeader />

      {showEditor ? (
        <>
          <div className="flex-1 flex flex-col min-h-0">
            <EditorX
              value=""
              onChange={setContent}
              onEscape={handleEscape}
              onModEnter={handleModEnter}
              placeholder="What's on your mind?..."
              className="flex-1"
              minHeight="30dvh"
              focusOnMount
            />
          </div>
          <div className="grid grid-cols-2 border-t border-border shrink-0">
            <button
              type="button"
              onClick={handleCloseEditor}
              className="h-12 bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCapture}
              disabled={!content.trim() || isSubmitting}
              className="h-12 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? <Spinner className="size-4 mx-auto" /> : "Create"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={handleOpenEditor}
              className="aspect-square bg-card text-muted-foreground font-semibold text-sm hover:border-solid hover:border-primary/50 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30"
            >
              <Keyboard className="size-8" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMicDialog(true)}
              className="aspect-square bg-card text-muted-foreground font-semibold text-sm hover:border-solid hover:border-primary/50 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30"
            >
              <Mic className="size-8" />
              <span>Record</span>
            </button>
            </div>
        </>
      )}

      <div className="flex items-center justify-center pb-3 pt-2 gap-2">
        <ChevronUp className={cn("size-3.5 text-muted-foreground/30 transition-all duration-150", isSwipingUp && "text-primary/60 -translate-y-0.5")} />
        <span className="text-[11px] text-muted-foreground/40">Swipe to see all ideas</span>
        <ChevronUp className={cn("size-3.5 text-muted-foreground/30 transition-all duration-150", isSwipingUp && "text-primary/60 -translate-y-0.5")} />
      </div>

      {showCreatedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium shadow-lg transition-opacity duration-200">
          Idea created
        </div>
      )}

      <Dialog open={showMicDialog} onOpenChange={setShowMicDialog}>
        <DialogContent className="max-w-[280px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-base">Voice recording</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 pb-4">
            <Mic className="size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              This feature will be available soon.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
