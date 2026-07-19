"use client";

import { useCallback } from "react";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { ShortcutHelp } from "@/components/shortcuts/shortcut-help";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUIStore } from "@/stores/ui-store";
import { useSearchStore } from "@/stores/search-store";
import { MobileLayout } from "@/components/app/mobile-layout";
import { IdeasTabs } from "@/components/ideas/ideas-tabs";
import { QuickCapture } from "@/components/ideas/quick-capture";
import { ideasApi } from "@/lib/api-client";
import { revalidateAllIdeas } from "@/lib/swr-helpers";
import { BottomNav } from "@/components/app/bottom-nav";
import { PinnedTray } from "@/components/ideas/pinned-tray";

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const isMobile = useIsMobile();
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const captureOpen = useUIStore((s) => s.captureOpen);
  const setCaptureOpen = useUIStore((s) => s.setCaptureOpen);
  const searchMode = useSearchStore((s) => s.searchMode);

  const handleCapture = useCallback(async (content: string) => {
    const response = await ideasApi.create(content)
    if (response.ok) revalidateAllIdeas()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
      <ShortcutHelp />

      {isMobile ? (
        <MobileLayout />
      ) : (
        <>
          <main className="flex-1 container max-w-5xl mx-auto px-4 pt-6 pb-12">
            <QuickCapture
              onCapture={handleCapture}
              isOpen={captureOpen}
              onOpenChange={setCaptureOpen}
            />
            <div className="mt-1">
              <IdeasTabs
                tabsClassName="space-y-6"
                tabsListClassName="grid w-full max-w-md mx-auto grid-cols-3 bg-transparent p-0 rounded-none"
                triggerClassName="gap-2 rounded-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-auto py-2"
                hideCaptureInbox
              />
            </div>
          </main>
          <div className="fixed bottom-0 left-0 right-0 z-40 max-md:hidden">
            <BottomNav />
          </div>
        </>
      )}
      {!searchMode && <PinnedTray />}
    </div>
  );
}
