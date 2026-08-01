"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, Mic, ChevronUp } from "lucide-react";
import { MobileHeader } from "@/components/app/mobile-header";
import { MobileEditor } from "@/components/editor/mobile-editor";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createIdea } from "@/lib/create-idea";
import { useSwipeUp } from "@/hooks/use-swipe";

const DASHBOARD_HREF = "/dashboard";

export function MobileCaptureEntry() {
  const router = useRouter();
  const [showEditor, setShowEditor] = useState(false);
  const [showMicDialog, setShowMicDialog] = useState(false);
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const prefetched = useRef(false);

  useEffect(() => {
    if (!showCreatedToast) return;
    const timer = setTimeout(() => setShowCreatedToast(false), 2000);
    return () => clearTimeout(timer);
  }, [showCreatedToast]);

  const { isSwipingUp, onTouchStart, onTouchMove, onTouchEnd } = useSwipeUp({
    onSwipeUp: () => router.push(DASHBOARD_HREF),
    onTouchStart: () => {
      if (!prefetched.current) {
        prefetched.current = true;
        router.prefetch(DASHBOARD_HREF);
      }
    },
  });

  const handleOpenEditor = useCallback(() => {
    setShowEditor(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
  }, []);

  const handleCapture = useCallback(async (content: string) => {
    const { ok } = await createIdea(content);
    if (ok) setShowCreatedToast(true);
  }, []);

  return (
    <div
      className="flex flex-col h-dvh bg-background"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <MobileHeader />

      {showEditor ? (
        <MobileEditor
          onCapture={handleCapture}
          onClose={handleCloseEditor}
          overlay={false}
        />
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
        <ChevronUp
          className={cn(
            "size-3.5 text-muted-foreground/30 transition-all duration-150",
            isSwipingUp && "text-primary/60 -translate-y-0.5",
          )}
        />
        <span className="text-[11px] text-muted-foreground/40">
          Swipe to see all ideas
        </span>
        <ChevronUp
          className={cn(
            "size-3.5 text-muted-foreground/30 transition-all duration-150",
            isSwipingUp && "text-primary/60 -translate-y-0.5",
          )}
        />
      </div>

      {showCreatedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium shadow-lg transition-opacity duration-200">
          Idea created
        </div>
      )}

      <Dialog open={showMicDialog} onOpenChange={setShowMicDialog}>
        <DialogContent className="max-w-70 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-base">
              Voice recording
            </DialogTitle>
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
  );
}
