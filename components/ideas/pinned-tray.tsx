"use client";

import { useCallback, useRef, useEffect } from "react";
import { Pin, X, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { usePinnedIdeas } from "@/hooks/use-pinned-ideas";
import { useIdeas } from "@/hooks/use-ideas";
import { useHotkey } from "@tanstack/react-hotkeys";
import { SHORTCUTS } from "@/lib/shortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

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
    <div className="pinned-tray-card group relative min-h-24 rounded-md border bg-popover shadow-sm hover:border-primary/70">
      <button
        type="button"
        className="absolute inset-0 z-10 w-full cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label={
          idea.content
            ? `Focus pinned idea: ${idea.content.slice(0, 60)}`
            : "Focus pinned idea"
        }
        onClick={() => onFocus?.(idea.id)}
      />
      <div className="relative z-20 pointer-events-none px-3 pb-3 pt-5">
        <div className="absolute -top-px left-2 flex items-center gap-1">
          <Badge
            variant="outline"
            className="h-5 rounded-t-none border-t-0 bg-popover px-1.5 text-[10px] text-muted-foreground"
          >
            <Pin className="size-2.5" />
          </Badge>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnpin(idea.id);
          }}
          className="pointer-events-auto absolute right-2 top-2 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          aria-label="Unpin"
        >
          <X className="size-3.5" />
        </button>
        <span className="line-clamp-2 break-words pr-5 text-sm font-medium leading-snug text-foreground">
          {idea.content}
        </span>
        <span className="mt-1 block text-xs leading-none text-muted-foreground">
          {pinnedDate}
        </span>
      </div>
    </div>
  );
}

export function PinnedTray() {
  const { ideas, isLoading, mutate } = usePinnedIdeas();
  const { updatePin } = useIdeas({ status: "inbox" });
  const isMobile = useIsMobile();
  const isOpen = useUIStore((s) => s.pinnedTrayOpen);
  const setPinnedTrayOpen = useUIStore((s) => s.setPinnedTrayOpen);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setFocusIdeaId = useUIStore((s) => s.setFocusIdeaId);
  const hasPins = ideas.length > 0;
  const extraCount = ideas.length - 1;
  const trayRef = useRef<HTMLDivElement>(null);
  const previewCount = Math.min(ideas.length, 3);

  const handleFocusIdea = useCallback(
    (id: string) => {
      setFocusIdeaId(id);
      setActiveTab("inbox");
    },
    [setFocusIdeaId, setActiveTab],
  );

  useHotkey(
    SHORTCUTS.togglePinnedTray.hotkeys[0],
    () => setPinnedTrayOpen(!isOpen),
    { enabled: true },
  );

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (
        trayRef.current &&
        e.target instanceof Node &&
        !trayRef.current.contains(e.target)
      ) {
        setPinnedTrayOpen(false);
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
  }, [isOpen, setPinnedTrayOpen, isMobile]);

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
          onFocus={handleFocusIdea}
        />
      ))}
    </div>
  );

  return (
    <>
      {!isMobile && hasPins && !isOpen && (
        <button
          type="button"
          onClick={() => setPinnedTrayOpen(true)}
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
        </button>
      )}

      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setPinnedTrayOpen}>
          <DrawerContent className="flex max-h-[60vh] flex-col gap-0 p-0 border-t">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Pinned ideas</DrawerTitle>
            </DrawerHeader>
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
          </DrawerContent>
        </Drawer>
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
                  type="button"
                  onClick={() => setPinnedTrayOpen(false)}
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
