"use client"

import { useCallback } from "react"
import { Pin, X } from "lucide-react"
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

  useHotkey(
    SHORTCUTS.togglePinnedTray.hotkeys[0],
    () => onOpenChange(!isOpen),
    { enabled: true },
  )

  const handleUnpin = useCallback(async (id: string) => {
    await updatePin(id, false)
    mutate()
  }, [updatePin, mutate])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "flex flex-col p-0 gap-0 [&>button:last-child]:hidden",
          isMobile
            ? "max-h-[70vh]"
            : "sm:left-4 sm:right-auto sm:w-80 sm:max-h-[60vh] sm:bottom-4 sm:rounded-lg sm:border"
        )}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b shrink-0">
          <SheetTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Pinned
          </SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close pinned tray"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto min-h-0 flex-1">
          {isLoading && ideas.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground text-center">
              Loading...
            </div>
          ) : ideas.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground text-center">
              No pinned ideas yet
            </div>
          ) : (
            <div className="divide-y">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="group flex items-start gap-2 px-3 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug line-clamp-2 break-words">
                      {idea.content}
                    </p>
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
      </SheetContent>
    </Sheet>
  )
}
