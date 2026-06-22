"use client";

import { useState } from "react";
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { ShortcutHelp } from "@/components/shortcuts/shortcut-help";
import { SHORTCUTS } from "@/lib/shortcuts";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearch } from "@/hooks/use-search";
import { MobileLayout } from "@/components/app/mobile-layout";
import { IdeasTabs } from "@/components/ideas/ideas-tabs";
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
  const [keyboardEnabled] = useShortcutPreference("troje-keyboard-nav");
  const [settingsKeyEnabled] = useShortcutPreference("troje-shortcut-settings");
  const search = useSearch();

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
          search={search}
        />
      ) : (
        <>
          <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 pt-16 pb-12">
            <IdeasTabs
              value={activeTab}
              onValueChange={setActiveTab}
              search={search.debouncedSearch}
              tabsClassName="space-y-6"
              tabsListClassName="grid w-full max-w-md mx-auto grid-cols-3"
              triggerClassName="gap-2"
            />
          </main>
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <BottomNav
              onSettingsOpen={() => setSettingsOpen(true)}
              search={search}
            />
          </div>
        </>
      )}
    </div>
  );
}
