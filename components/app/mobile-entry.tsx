"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, Mic, ChevronUp } from "lucide-react";
import { MobileHeader } from "@/components/app/mobile-header";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSwipeUp } from "@/hooks/use-swipe";

const DASHBOARD_HREF = "/dashboard";
const CAPTURE_HREF = "/mobile/capture?from=mobile";

export function MobileCaptureEntry() {
  const router = useRouter();
  const [showMicDialog, setShowMicDialog] = useState(false);
  const prefetched = useRef(false);
  const capturePrefetched = useRef(false);

  const { isSwipingUp, onTouchStart, onTouchMove, onTouchEnd } = useSwipeUp({
    onSwipeUp: () => router.push(DASHBOARD_HREF),
    onTouchStart: () => {
      if (!prefetched.current) {
        prefetched.current = true;
        router.prefetch(DASHBOARD_HREF);
      }
    },
  });

  const handleOpenCapture = useCallback(() => {
    router.push(CAPTURE_HREF);
  }, [router]);

  const handleCaptureTouchStart = useCallback(() => {
    if (!capturePrefetched.current) {
      capturePrefetched.current = true;
      router.prefetch(CAPTURE_HREF);
    }
  }, [router]);

  return (
    <div
      className="flex flex-col h-dvh bg-background"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <MobileHeader />

      <div className="flex-1" />
      <div className="grid grid-cols-2">
        <button
          type="button"
          onClick={handleOpenCapture}
          onTouchStart={handleCaptureTouchStart}
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
