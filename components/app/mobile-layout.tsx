"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { QuickCapture } from "@/components/ideas/quick-capture";
import { useIdeas } from "@/hooks/use-ideas";
import { IdeasTabs } from "@/components/ideas/ideas-tabs";
import { BottomNav } from "@/components/app/bottom-nav";
import { cn } from "@/lib/utils";

type TabValue = "inbox" | "archived" | "deleted";

interface MobileLayoutProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  onPinnedToggle: () => void;
  onSettingsOpen: () => void;
  onSearchModeChange?: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  handleClearSearch: () => void;
  focusIdeaId?: string | null;
}

export function MobileLayout({
  activeTab,
  onTabChange,
  onPinnedToggle,
  onSettingsOpen,
  onSearchModeChange,
  searchQuery,
  setSearchQuery,
  debouncedSearch,
  handleClearSearch,
  focusIdeaId,
}: MobileLayoutProps) {
  const { create } = useIdeas({ status: "inbox" });

  const [captureOpen, setCaptureOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [topHidden, setTopHidden] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollY = useRef(0);

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

      if (delta > 5 && scrollY > 150 && !captureOpen) {
        setTopHidden(true);
      } else if (delta < -5 || scrollY === 0) {
        setTopHidden(false);
      }
      prevScrollY.current = scrollY;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [captureOpen]);

  const showBanner =
    !isStandalone && deferredPrompt !== null && !bannerDismissed;

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
    setBannerDismissed(true);
  }, [deferredPrompt]);

  const handleCapture = useCallback(
    async (content: string) => {
      await create(content);
      setCaptureOpen(false);
    },
    [create],
  );

  return (
    <div className="flex flex-col h-screen">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <header className="px-4 h-14 border-b bg-background flex items-center justify-center">
          <div className="flex-1 border-t border-foreground/10" />
          <div className="flex items-center gap-1.5 px-3">
            <img src="/icon.svg" alt="Troje" className="size-7" />
            <span className="text-2xl font-bold">Troje</span>
          </div>
          <div className="flex-1 border-t border-foreground/10" />
        </header>

        {showBanner && (
          <div className="relative w-full h-10 bg-primary/5 overflow-hidden">
            <div
              onClick={handleInstall}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleInstall();
                }
              }}
              role="button"
              tabIndex={0}
              className="w-full h-full flex items-center pr-8 marquee-track cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="marquee-content whitespace-nowrap text-xs text-primary/70">
                <span>
                  Tap to install Troje — Add to home screen for a native
                  experience •{" "}
                </span>
                <span>
                  Tap to install Troje — Add to home screen for a native
                  experience •{" "}
                </span>
              </div>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-primary/70 hover:text-primary z-10"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <IdeasTabs
          value={activeTab}
          onValueChange={onTabChange}
          search={debouncedSearch}
          onOpenCapture={() => setCaptureOpen(true)}
          tabsListClassName="w-full grid grid-cols-3 rounded-none"
          tabsListWrapperClassName={cn(
            "sticky top-0 z-40 bg-background transition-transform duration-300 ease-in-out will-change-transform",
            topHidden && "-translate-y-full",
          )}
          contentWrapperClassName="px-4 pt-4"
          showLabels={false}
          hideCaptureInbox
          focusIdeaId={focusIdeaId}
        >
          <div className="pb-0">
            <QuickCapture
              onCapture={handleCapture}
              isOpen={captureOpen}
              onOpenChange={setCaptureOpen}
              onClose={() => setCaptureOpen(false)}
            />
          </div>
        </IdeasTabs>
      </div>

      <BottomNav onPinnedToggle={onPinnedToggle} onSettingsOpen={onSettingsOpen} onSearchModeChange={onSearchModeChange} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleClearSearch={handleClearSearch} />
    </div>
  );
}
