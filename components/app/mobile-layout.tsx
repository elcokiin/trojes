"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { IdeasTabs } from "@/components/ideas/ideas-tabs";
import { QuickCapture } from "@/components/ideas/quick-capture";
import { MobileEditor } from "@/components/editor/mobile-editor";
import { BottomNav } from "@/components/app/bottom-nav";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { revalidateAllIdeas } from "@/lib/swr-helpers";
import { ideasApi } from "@/lib/api-client";

function isBeforeInstallPromptEvent(e: Event): e is BeforeInstallPromptEvent {
  return "prompt" in e;
}

export function MobileLayout() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [topHidden, setTopHidden] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollY = useRef(0);
  const captureOpen = useUIStore((s) => s.captureOpen);
  const setCaptureOpen = useUIStore((s) => s.setCaptureOpen);

  useEffect(() => {
    if (captureOpen && !mobileEditorOpen) {
      setMobileEditorOpen(true);
      setCaptureOpen(false);
    }
  }, [captureOpen, mobileEditorOpen, setCaptureOpen]);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    setIsStandalone(media.matches);

    const onStandaloneChange = (e: MediaQueryListEvent) =>
      setIsStandalone(e.matches);
    media.addEventListener("change", onStandaloneChange);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      media.removeEventListener("change", onStandaloneChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const delta = scrollY - prevScrollY.current;

      if (delta > 5 && scrollY > 150 && !mobileEditorOpen) {
        setTopHidden(true);
      } else if (delta < -5 || scrollY === 0) {
        setTopHidden(false);
      }
      prevScrollY.current = scrollY;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [mobileEditorOpen]);

  const showBanner =
    !isStandalone && deferredPrompt !== null && !bannerDismissed;

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    if (!isBeforeInstallPromptEvent(deferredPrompt)) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
    setBannerDismissed(true);
  }, [deferredPrompt]);

  const handleCapture = useCallback(async (content: string) => {
    const response = await ideasApi.create(content);
    if (response.ok) revalidateAllIdeas()
  }, []);

  const handleOpenCapture = useCallback(() => {
    setMobileEditorOpen(true);
    setCaptureOpen(false);
  }, [setCaptureOpen]);

  const handleCloseEditor = useCallback(() => {
    setMobileEditorOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-dvh">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <header className="px-4 h-14 border-b bg-background flex items-center justify-center">
          <div className="flex-1 border-t border-foreground/10" />
          <div className="flex items-center gap-1.5 px-3">
            <Image src="/icon.svg" alt="Trojes" width={28} height={28} className="size-7" />
            <span className="text-2xl font-bold">Trojes</span>
          </div>
          <div className="flex-1 border-t border-foreground/10" />
        </header>

        {showBanner && (
          <div className="relative w-full h-10 bg-primary/5 overflow-hidden">
            <button
              type="button"
              onClick={handleInstall}
              className="w-full h-full flex items-center pr-8 marquee-track cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="marquee-content whitespace-nowrap text-xs text-primary/70">
                <span>
                  Tap to install Trojes — Add to home screen for a native
                  experience •{" "}
                </span>
                <span>
                  Tap to install Trojes — Add to home screen for a native
                  experience •{" "}
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-primary/70 hover:text-primary z-10"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <IdeasTabs
          tabsListClassName="w-full grid grid-cols-3 rounded-none"
          tabsListWrapperClassName={cn(
            "sticky top-0 z-40 bg-background transition-transform duration-300 ease-in-out will-change-transform",
            topHidden && "-translate-y-full",
          )}
          contentWrapperClassName="px-4 pt-4"
          showLabels={false}
          hideCaptureInbox
        >
          <div className="pb-0">
            <QuickCapture
              onCapture={handleCapture}
              isOpen={false}
              onOpenChange={handleOpenCapture}
            />
          </div>
        </IdeasTabs>
      </div>

      {mobileEditorOpen && (
        <MobileEditor
          onCapture={handleCapture}
          onClose={handleCloseEditor}
        />
      )}

      <BottomNav />
    </div>
  );
}
