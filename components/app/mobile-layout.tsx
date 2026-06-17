"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Pin, Settings } from "lucide-react";
import { QuickCapture } from "@/components/ideas/quick-capture";
import { Button } from "@/components/ui/button";
import { useIdeas } from "@/hooks/use-ideas";
import { IdeasTabs } from "@/components/ideas/ideas-tabs";

type TabValue = "inbox" | "archived" | "deleted";

interface MobileLayoutProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  onSettingsOpen: () => void;
}

export function MobileLayout({
  activeTab,
  onTabChange,
  onSettingsOpen,
}: MobileLayoutProps) {
  const { create } = useIdeas({ status: "inbox" });

  const [captureOpen, setCaptureOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

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
    <div className="md:hidden flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <header className="px-4 h-14 border-b bg-background flex items-center justify-center">
          <div className="flex-1 border-t border-foreground/10" />
          <span className="px-3 font-semibold text-base">Troje</span>
          <div className="flex-1 border-t border-foreground/10" />
        </header>

        {showBanner && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <Download className="size-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Install Troje</p>
                <p className="text-xs text-muted-foreground">
                  Add to home screen for a native app experience
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setBannerDismissed(true)}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleInstall}
                >
                  Install
                </Button>
              </div>
            </div>
          </div>
        )}

        <IdeasTabs
          value={activeTab}
          onValueChange={onTabChange}
          tabsListClassName="w-full grid grid-cols-3 rounded-none"
          tabsListWrapperClassName="sticky top-0 z-40 bg-background"
          contentWrapperClassName="px-4 pt-4"
          showLabels={false}
          hideCaptureInbox
        >
          <div className="px-4 pt-3 pb-0 space-y-3">
            <QuickCapture
              onCapture={handleCapture}
              isOpen={captureOpen}
              onOpenChange={setCaptureOpen}
              onClose={() => setCaptureOpen(false)}
            />
          </div>
        </IdeasTabs>
      </div>

      <nav className="shrink-0 h-12 border-t bg-background flex items-stretch">
        <button className="flex items-center justify-center text-muted-foreground px-4">
          <Pin className="size-4" />
        </button>
        <button className="flex-1 flex items-center justify-center text-muted-foreground border-x border-dashed border-muted-foreground h-full">
          <span className="text-xs font-bold tracking-widest">SEARCH</span>
        </button>
        <button
          onClick={onSettingsOpen}
          className="flex items-center justify-center text-muted-foreground px-4"
        >
          <Settings className="size-4" />
        </button>
      </nav>
    </div>
  );
}
