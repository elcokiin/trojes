"use client";

import { useState, useEffect, useCallback } from "react";
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeasList } from "@/components/ideas/ideas-list";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { ShortcutHelp } from "@/components/shortcuts/shortcut-help";
import {
  Inbox,
  Archive,
  Trash2,
  Search,
  Settings,
  Download,
  Pin,
} from "lucide-react";
import { UserMenu } from "@/components/account/user-menu";
import { SHORTCUTS } from "@/lib/shortcuts";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { QuickCapture } from "@/components/ideas/quick-capture";
import { useIdeas } from "@/hooks/use-ideas";
import { Button } from "@/components/ui/button";

type TabValue = "inbox" | "archived" | "deleted";

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("inbox");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyboardEnabled] = useShortcutPreference("troje-keyboard-nav");
  const [settingsKeyEnabled] = useShortcutPreference("troje-shortcut-settings");
  const [captureOpen, setCaptureOpen] = useState(false);
  const { create } = useIdeas({ status: "inbox" });

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
    <div className="min-h-screen bg-background">
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ShortcutHelp />

      {/* Desktop layout */}
      <div className="hidden md:block">
        <div className="fixed top-4 right-4 z-50">
          <UserMenu user={user} />
        </div>
        <main className="container max-w-5xl mx-auto px-4 py-8 pt-16">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="inbox" className="gap-2">
                <Inbox className="size-4" />
                <span className="hidden sm:inline">Inbox</span>
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-2">
                <Archive className="size-4" />
                <span className="hidden sm:inline">Archived</span>
              </TabsTrigger>
              <TabsTrigger value="deleted" className="gap-2">
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Trash</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox">
              <IdeasList status="inbox" active={activeTab === "inbox"} />
            </TabsContent>

            <TabsContent value="archived">
              <IdeasList status="archived" active={activeTab === "archived"} />
            </TabsContent>

            <TabsContent value="deleted">
              <IdeasList status="deleted" active={activeTab === "deleted"} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Mobile PWA layout */}
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

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <div className="sticky top-0 z-40 bg-background">
              <div className="px-4 pt-3 pb-0 space-y-3">
                <QuickCapture
                  onCapture={handleCapture}
                  isOpen={captureOpen}
                  onOpenChange={setCaptureOpen}
                  onClose={() => setCaptureOpen(false)}
                />
              </div>
              <TabsList className="w-full grid grid-cols-3 rounded-none">
                <TabsTrigger value="inbox">
                  <Inbox className="size-4" />
                </TabsTrigger>
                <TabsTrigger value="archived">
                  <Archive className="size-4" />
                </TabsTrigger>
                <TabsTrigger value="deleted">
                  <Trash2 className="size-4" />
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-4 pt-4">
              <TabsContent value="inbox">
                <IdeasList
                  status="inbox"
                  active={activeTab === "inbox"}
                  hideCapture
                />
              </TabsContent>
              <TabsContent value="archived">
                <IdeasList
                  status="archived"
                  active={activeTab === "archived"}
                />
              </TabsContent>
              <TabsContent value="deleted">
                <IdeasList status="deleted" active={activeTab === "deleted"} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <nav className="shrink-0 h-12 border-t bg-background flex items-stretch">
          <button className="flex items-center justify-center text-muted-foreground px-4">
            <Pin className="size-4" />
          </button>
          <button className="flex-1 flex items-center justify-center text-muted-foreground border-x border-dashed border-muted-foreground h-full">
            <span className="text-xs font-bold tracking-widest">SEARCH</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center text-muted-foreground px-4"
          >
            <Settings className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
