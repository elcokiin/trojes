"use client";

import { useState, useCallback } from "react";
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys";
import { mutate } from "swr";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { ShortcutHelp } from "@/components/shortcuts/shortcut-help";
import { SHORTCUTS } from "@/lib/shortcuts";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearch } from "@/hooks/use-search";
import { MobileLayout } from "@/components/app/mobile-layout";
import { IdeasTabs } from "@/components/ideas/ideas-tabs";
import { QuickCapture } from "@/components/ideas/quick-capture";
import { ideasApi } from "@/lib/api-client";
import { BottomNav } from "@/components/app/bottom-nav";

type TabValue = "inbox" | "archived" | "deleted";

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabValue>("inbox");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [keyboardEnabled] = useShortcutPreference("troje-keyboard-nav");
  const [settingsKeyEnabled] = useShortcutPreference("troje-shortcut-settings");
  const { searchQuery, setSearchQuery, debouncedSearch, handleClearSearch } = useSearch();

  const hotkeys: Array<UseHotkeyDefinition> = [
    {
      hotkey: SHORTCUTS.inbox.hotkeys[0],
      callback: () => setActiveTab("inbox"),
      options: { enabled: keyboardEnabled },
    },
    {
      hotkey: SHORTCUTS.archived.hotkeys[0],
      callback: () => setActiveTab("archived"),
      options: { enabled: keyboardEnabled },
    },
    {
      hotkey: SHORTCUTS.trash.hotkeys[0],
      callback: () => setActiveTab("deleted"),
      options: { enabled: keyboardEnabled },
    },
    {
      hotkey: SHORTCUTS.settings.hotkeys[0],
      callback: () => setSettingsOpen((prev) => !prev),
      options: { enabled: keyboardEnabled && settingsKeyEnabled },
    },
    {
      hotkey: SHORTCUTS.settings.hotkeys[1],
      callback: () => setSettingsOpen((prev) => !prev),
      options: { enabled: keyboardEnabled && settingsKeyEnabled },
    },
  ];

  const handleCapture = useCallback(async (content: string) => {
    const response = await ideasApi.create(content)
    if (response.ok) {
      mutate(
        (key) => typeof key === "string" && key.startsWith("/api/ideas"),
      )
    }
  }, [])

  const handleOpenCapture = useCallback(() => {
    setCaptureOpen(true)
  }, [])

  useHotkeys(hotkeys, {
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
      <ShortcutHelp />

      {isMobile ? (
        <MobileLayout
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v)}
          onSettingsOpen={() => setSettingsOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          debouncedSearch={debouncedSearch}
          handleClearSearch={handleClearSearch}
        />
      ) : (
        <>
          <main className="flex-1 container max-w-5xl mx-auto px-4 pt-6 pb-12">
            <QuickCapture
              isOpen={captureOpen}
              onOpenChange={setCaptureOpen}
              onCapture={handleCapture}
            />
            <div className="mt-1">
              <IdeasTabs
                value={activeTab}
                onValueChange={setActiveTab}
                search={debouncedSearch}
                onOpenCapture={handleOpenCapture}
                hideCaptureInbox
                tabsClassName="space-y-6"
                tabsListClassName="grid w-full max-w-md mx-auto grid-cols-3 bg-transparent p-0 rounded-none"
                triggerClassName="gap-2 rounded-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-auto py-2"
              />
            </div>
          </main>
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <BottomNav
              onSettingsOpen={() => setSettingsOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleClearSearch={handleClearSearch}
            />
          </div>
        </>
      )}
    </div>
  );
}
