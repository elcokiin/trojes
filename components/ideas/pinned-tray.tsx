"use client"

import { useCallback } from "react"
import { Pin, X, ChevronUp } from "lucide-react"
import { usePinnedIdeas } from "@/hooks/use-pinned-ideas"
import { useIdeas } from "@/hooks/use-ideas"
import { useHotkey } from "@tanstack/react-hotkeys"
import { SHORTCUTS } from "@/lib/shortcuts"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface PinnedTrayProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function PinnedTray({ isOpen, onOpenChange }: PinnedTrayProps) {
  const { ideas, isLoading, mutate } = usePinnedIdeas()
  const { updatePin } = useIdeas({ status: "inbox" })
  const isMobile = useIsMobile()
  const hasPins = ideas.length > 0
  const previewIdea = ideas[0]
  const extraCount = ideas.length - 1

  useHotkey(
    SHORTCUTS.togglePinnedTray.hotkeys[0],
    () => onOpenChange(!isOpen),
    { enabled: true },
  )

  const handleUnpin = useCallback(async (id: string) => {
    await updatePin(id, false)
    mutate()
  }, [updatePin, mutate])

  const handlePreviewClick = useCallback(() => {
    onOpenChange(true)
  }, [onOpenChange])

  const pinnedCardsList = (
    <div className="overflow-y-auto min-h-0 flex-1">
      {isLoading && ideas.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground text-center">Loading...</div>
      ) : ideas.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground text-center">No pinned ideas yet</div>
      ) : (
        <div className="divide-y">
          {ideas.map((idea) => (
            <div key={idea.id} className="group flex items-start gap-2 px-3 py-3 hover:bg-accent/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug line-clamp-2 break-words">{idea.content}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Pin className="size-2.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUnpin(idea.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                aria-label="Unpin"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {!isMobile && hasPins && !isOpen && (
        <button
          onClick={handlePreviewClick}
          className="fixed bottom-14 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-popover border rounded-lg shadow-lg p-3 flex items-start gap-2 text-left hover:bg-accent/50 transition-colors cursor-pointer group"
        >
          <Pin className="size-3.5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug line-clamp-1 break-words text-foreground/80">
              {previewIdea.content}
            </p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full self-center">
            {extraCount > 0 ? `+${extraCount}` : "1"}
          </span>
          <ChevronUp className="size-3.5 text-muted-foreground shrink-0 self-center" />
        </button>
      )}

      {isMobile ? (
        isOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-popover border-t rounded-t-xl shadow-lg max-h-[50vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pinned {hasPins && <span className="text-muted-foreground/50">({ideas.length})</span>}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close pinned tray"
              >
                <X className="size-4" />
              </button>
            </div>
            {pinnedCardsList}
          </div>
        )
      ) : (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent
            side="bottom"
            className={cn(
              "flex flex-col p-0 gap-0 [&>button:last-child]:hidden",
              "sm:left-4 sm:right-auto sm:w-80 sm:max-h-[60vh] sm:bottom-4 sm:rounded-lg sm:border"
            )}
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b shrink-0">
              <SheetTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pinned {hasPins && <span className="text-muted-foreground/50">({ideas.length})</span>}
              </SheetTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close pinned tray"
              >
                <X className="size-4" />
              </button>
            </div>
            {pinnedCardsList}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
