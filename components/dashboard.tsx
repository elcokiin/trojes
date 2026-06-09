"use client"

import { useState } from "react"
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IdeasList } from "@/components/ideas-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { ShortcutHelp } from "@/components/shortcut-help"
import { Inbox, Archive, Trash2 } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useTheme } from "@/components/theme-provider"
import { SHORTCUTS } from "@/lib/shortcuts"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"

type TabValue = "inbox" | "archived" | "deleted"

interface DashboardProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("inbox")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [keyboardEnabled] = useShortcutPreference("troje-keyboard-nav")
  const [themeToggleKeyEnabled] = useShortcutPreference("troje-shortcut-theme-toggle")
  const [settingsKeyEnabled] = useShortcutPreference("troje-shortcut-settings")

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
    {
      hotkey: SHORTCUTS.toggleTheme.hotkeys[0],
      callback: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      options: { enabled: keyboardEnabled && themeToggleKeyEnabled },
    },
  ]

  useHotkeys(hotkeys, {
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  return (
    <div className="min-h-screen bg-background">
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ShortcutHelp />
      
      {/* User menu in top right */}
      <div className="fixed top-4 right-4 z-50">
        <UserMenu user={user} />
      </div>
      
      <main className="container max-w-5xl mx-auto px-4 py-8 pt-16">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
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
  )
}
