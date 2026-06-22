"use client";

import { useCallback, useRef, useEffect } from "react";
import type React from "react";
import { Pin, X, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePinnedIdeas } from "@/hooks/use-pinned-ideas";
import { useIdeas } from "@/hooks/use-ideas";
import { useHotkey } from "@tanstack/react-hotkeys";
import { SHORTCUTS } from "@/lib/shortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PinnedTrayProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFocusIdea?: (id: string) => void;
}

function PinnedCard({
  idea,
  index,
  onUnpin,
  onFocus,
}: {
  idea: { id: string; content: string; created_at: string };
  index: number;
  onUnpin: (id: string) => void;
  onFocus?: (id: string) => void;
}) {
  const pinnedDate = new Date(idea.created_at).toLocaleDateString();

  return (
    <div
      className="pinned-tray-card group relative min-h-24 rounded-md border bg-popover px-3 pb-3 pt-5 shadow-sm hover:border-primary/70 cursor-pointer"
      style={{ "--pinned-index": index } as React.CSSProperties & Record<string, string | number>}
      onClick={() => onFocus?.(idea.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onFocus?.(idea.id);
      }}
    >
      <div className="absolute -top-px left-2 flex items-center gap-1">
        <Badge
          variant="outline"
          className="h-5 rounded-t-none border-t-0 bg-popover px-1.5 text-[10px] text-muted-foreground"
        >
          <Pin className="size-2.5" />
        </Badge>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnpin(idea.id);
        }}
        className="absolute right-2 top-2 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        aria-label="Unpin"
      >
        <X className="size-3.5" />
      </button>
      <p className="line-clamp-2 break-words pr-5 text-sm font-medium leading-snug text-foreground">
        {idea.content}
      </p>
      <p className="mt-1 text-xs leading-none text-muted-foreground">
        {pinnedDate}
      </p>
    </div>
  );
}

export function PinnedTray({
  isOpen,
  onOpenChange,
  onFocusIdea,
}: PinnedTrayProps) {
  const { ideas, isLoading, mutate } = usePinnedIdeas();
  const { updatePin } = useIdeas({ status: "inbox" });
  const isMobile = useIsMobile();
  const hasPins = ideas.length > 0;
  const extraCount = ideas.length - 1;
  const trayRef = useRef<HTMLDivElement>(null);
  const previewCount = Math.min(ideas.length, 3);

  useHotkey(
    SHORTCUTS.togglePinnedTray.hotkeys[0],
    () => onOpenChange(!isOpen),
    { enabled: true },
  );

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (trayRef.current && e.target instanceof Node && !trayRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    const id = setTimeout(
      () => document.addEventListener("mousedown", handler),
      0,
    );
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen, onOpenChange, isMobile]);

  const handleUnpin = useCallback(
    async (id: string) => {
      await updatePin(id, false);
      mutate();
    },
    [updatePin, mutate],
  );

  const loadingState = isLoading && ideas.length === 0 && (
    <div className="p-4 text-xs text-muted-foreground text-center">
      Loading...
    </div>
  );

  const emptyState = !isLoading && ideas.length === 0 && (
    <div className="p-4 text-xs text-muted-foreground text-center">
      No pinned ideas yet
    </div>
  );

  const listContent = ideas.length > 0 && (
    <div className="flex flex-col gap-2">
      {ideas.map((idea, index) => (
        <PinnedCard
          key={idea.id}
          idea={idea}
          index={index}
          onUnpin={handleUnpin}
          onFocus={onFocusIdea}
        />
      ))}
    </div>
  );

  return (
    <>
      {!isMobile && hasPins && !isOpen && (
        <div
          onClick={() => onOpenChange(true)}
          className="fixed bottom-0 left-0 z-50 flex min-h-32 w-1/3 min-w-0 cursor-pointer flex-col justify-end px-1.5 pb-1.5 pt-2"
          aria-label={`Open pinned ideas (${ideas.length})`}
        >
          <div className="pinned-tray-preview relative">
            {ideas.slice(0, previewCount).map((idea, i) => (
              <div
                key={idea.id}
                className={cn(
                  "absolute inset-x-1 rounded-md border bg-popover shadow-sm",
                  i === 0 &&
                    "bottom-0 z-30 min-h-16 border-primary/70 px-3 pb-2 pt-4",
                  i === 1 && "bottom-6 z-20 h-12 scale-[0.98] opacity-70",
                  i === 2 && "bottom-8 z-10 h-12 scale-[0.96] opacity-45",
                )}
              >
                {i === 0 ? (
                  <>
                    <div className="absolute -top-px left-2 flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="h-5 rounded-t-none border-t-0 bg-popover px-1.5 text-[10px] text-muted-foreground"
                      >
                        <Pin className="size-2.5" />
                      </Badge>
                    </div>
                    <p className="line-clamp-1 min-w-0 pr-5 text-sm font-medium leading-snug text-foreground">
                      {idea.content}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                      {ideas.length} ideas pinned
                    </p>
                  </>
                ) : (
                  <div className="h-full rounded-md bg-popover" />
                )}
              </div>
            ))}
            <div className="relative z-0 flex h-10 items-center justify-center gap-1 border-t bg-background text-xs font-semibold uppercase tracking-wide text-muted-foreground rounded-b-md">
              <ChevronUp className="size-3" />
              <span>Pinned</span>
              {extraCount > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] normal-case tracking-normal">
                  +{extraCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent
            side="bottom"
            className="flex max-h-[60vh] flex-col gap-0 p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Pinned ideas</SheetTitle>
            </SheetHeader>
            <div className="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-muted" />
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pinned{" "}
                {hasPins && (
                  <span className="text-muted-foreground/50">
                    ({ideas.length})
                  </span>
                )}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {loadingState}
              {emptyState}
              {listContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        isOpen && (
          <div
            ref={trayRef}
            className="pointer-events-none fixed bottom-0 left-0 z-50 w-1/3 min-w-0 px-1.5 pb-12"
          >
            <div className="pinned-tray-list pointer-events-auto max-h-[calc(100vh-5rem)] overflow-y-auto rounded-t-md bg-popover shadow-lg hide-scrollbar">
              <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-popover px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Pin className="size-3" />
                  Pinned{" "}
                  {hasPins && (
                    <span className="text-muted-foreground/50">
                      ({ideas.length})
                    </span>
                  )}
                </span>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close pinned tray"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-2">
                {loadingState}
                {emptyState}
                {listContent}
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
