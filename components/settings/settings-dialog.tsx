"use client"

import { useState, useEffect } from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { useTheme } from "@/components/providers/theme-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import {
  Key,
  Keyboard,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Palette,
  Settings,
  Smartphone,
  Sun,
} from "lucide-react"
import { ShortcutKbd, ShortcutKbdGroup } from "@/components/shortcuts/shortcut-kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ApiKeysManager } from "@/components/settings/api-keys-manager"
import { PwaInstallManager } from "@/components/settings/pwa-install-manager"
import { SHORTCUTS } from "@/lib/shortcuts"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type SettingsSection = "appearance" | "keyboard" | "api" | "install"

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [keyboardNav, setKeyboardNav] = useShortcutPreference("troje-keyboard-nav")
  const [newIdeaKeyEnabled, setNewIdeaKeyEnabled] = useShortcutPreference("troje-shortcut-new-idea")
  const [themeToggleKeyEnabled, setThemeToggleKeyEnabled] = useShortcutPreference("troje-shortcut-theme-toggle")
  const [settingsKeyEnabled, setSettingsKeyEnabled] = useShortcutPreference("troje-shortcut-settings")
  const [shortcutHintsEnabled, setShortcutHintsEnabled] = useShortcutPreference("troje-shortcut-hints")
  const [section, setSection] = useState<SettingsSection>("appearance")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia("(max-width: 767px)")
    const syncMobile = (matches: boolean) => setIsMobile(matches)
    syncMobile(media.matches)

    const onMediaChange = (e: MediaQueryListEvent) => {
      syncMobile(e.matches)
    }

    media.addEventListener("change", onMediaChange)

    return () => media.removeEventListener("change", onMediaChange)
  }, [])

  useEffect(() => {
    if (isMobile && section === "keyboard") {
      setSection("appearance")
    }
  }, [isMobile, section])

  useHotkey(SHORTCUTS.expandSettings.hotkeys[0], () => {
    onOpenChange?.(true)
    setIsExpanded((prev) => !prev)
  }, {
    enabled: settingsKeyEnabled,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  const sidebarItems = [
    {
      id: "appearance",
      icon: Palette,
      label: "Theme",
    },
    {
      id: "keyboard",
      icon: Keyboard,
      label: "Keybindings",
      desktopOnly: true,
    },
    {
      id: "api",
      icon: Key,
      label: "API Keys",
    },
    {
      id: "install",
      icon: Smartphone,
      label: "Install App",
      mobileOnly: true,
    },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative overflow-visible">
            <Settings className="size-5" />
            <ShortcutKbd
              hotkey={SHORTCUTS.settings.hotkeys[0]}
              className="absolute -right-1 -top-1 h-4 min-w-4 rotate-12 px-1 text-[10px] shadow-sm"
            />
            <span className="sr-only">Settings</span>
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          isExpanded
            ? "!h-[calc(100vh-2rem)] !max-h-[calc(100vh-2rem)] !w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] sm:!max-w-[calc(100vw-2rem)]"
            : "h-[min(720px,calc(100vh-2rem))] sm:max-w-4xl"
        )}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-ml-2"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? "Restore settings dialog" : "Expand settings dialog"}
                >
                  {isExpanded ? <Minimize2 /> : <Maximize2 />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="inline-flex items-center gap-2">
                  {isExpanded ? "Restore settings" : "Expand settings"}
                  <ShortcutKbd hotkey={SHORTCUTS.expandSettings.hotkeys[0]} />
                </span>
              </TooltipContent>
            </Tooltip>
            <div className="min-w-0">
              <DialogTitle className="text-xl">Settings</DialogTitle>
              <DialogDescription>
                Configure your Troje experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <aside className="shrink-0 border-b bg-muted/20 md:w-64 md:border-b-0 md:border-r">
            <ScrollArea className="w-full md:h-full">
              <nav className="flex gap-1 p-3 md:flex-col">
                {sidebarItems.map((item) => {
                  if ("desktopOnly" in item && item.desktopOnly && isMobile) return null
                  if ("mobileOnly" in item && item.mobileOnly && !isMobile) return null

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSection(item.id)}
                      className={cn(
                        "grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground md:w-full",
                        section === item.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </ScrollArea>
          </aside>

          <div className="min-h-0 flex-1 bg-background">
            <ScrollArea className="h-full">
              <section className="flex flex-col gap-6 p-6">
                {section === "appearance" && (
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-medium">Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={mounted && theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="gap-2"
                      >
                        <Sun className="size-4" />
                        Light
                      </Button>
                      <Button
                        variant={mounted && theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="gap-2"
                      >
                        <Moon className="size-4" />
                        Dark
                      </Button>
                      <Button
                        variant={mounted && theme === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("system")}
                        className="gap-2"
                      >
                        <Monitor className="size-4" />
                        System
                      </Button>
                    </div>
                  </div>
                )}

                {!isMobile && section === "keyboard" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Keyboard />
                          Keyboard Navigation
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Navigate with vim-style keys
                        </p>
                      </div>
                      <Switch
                        checked={keyboardNav}
                        onCheckedChange={setKeyboardNav}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label className="text-sm font-medium">Shortcut Hints</Label>
                        <p className="text-xs text-muted-foreground">
                          Show key labels on controls and shortcut lists
                        </p>
                      </div>
                      <Switch
                        checked={shortcutHintsEnabled}
                        onCheckedChange={setShortcutHintsEnabled}
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-2">
                      <Label className="text-sm font-medium">Shortcut Toggles</Label>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">New idea key</p>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <span>Quick capture shortcut</span>
                            <ShortcutKbdGroup
                              hotkeys={SHORTCUTS.newIdea.hotkeys}
                              className="flex-wrap justify-end"
                            />
                          </div>
                        </div>
                        <Switch
                          checked={newIdeaKeyEnabled}
                          onCheckedChange={setNewIdeaKeyEnabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">Theme toggle key</p>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <span>Light/dark theme shortcut</span>
                            <ShortcutKbdGroup
                              hotkeys={SHORTCUTS.toggleTheme.hotkeys}
                              className="flex-wrap justify-end"
                            />
                          </div>
                        </div>
                        <Switch
                          checked={themeToggleKeyEnabled}
                          onCheckedChange={setThemeToggleKeyEnabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">Settings key</p>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <span>Settings dialog shortcuts</span>
                            <ShortcutKbdGroup
                              hotkeys={SHORTCUTS.settings.hotkeys}
                              className="flex-wrap justify-end"
                            />
                          </div>
                        </div>
                        <Switch
                          checked={settingsKeyEnabled}
                          onCheckedChange={setSettingsKeyEnabled}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-2">
                      <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
                      <div className="grid gap-2 text-sm">
                        {[
                          SHORTCUTS.newIdea,
                          SHORTCUTS.toggleTheme,
                          SHORTCUTS.settings,
                          SHORTCUTS.expandSettings,
                          SHORTCUTS.help,
                          SHORTCUTS.inbox,
                          SHORTCUTS.archived,
                          SHORTCUTS.trash,
                          SHORTCUTS.navDown,
                          SHORTCUTS.navUp,
                          SHORTCUTS.navLeft,
                          SHORTCUTS.navRight,
                          SHORTCUTS.openActions,
                          SHORTCUTS.copyIdea,
                          SHORTCUTS.deselect,
                          SHORTCUTS.saveCapture,
                          SHORTCUTS.cancelCapture,
                        ].map((shortcut) => (
                          <div key={shortcut.id} className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{shortcut.label}</span>
                            <ShortcutKbdGroup
                              hotkeys={shortcut.hotkeys}
                              className="flex-wrap justify-end"
                              alwaysVisible
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {section === "api" && <ApiKeysManager />}
                {isMobile && section === "install" && <PwaInstallManager />}
              </section>
            </ScrollArea>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
