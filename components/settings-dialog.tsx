"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
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
import { Switch } from "@/components/ui/switch"
import { Settings, Keyboard, Moon, Sun, Monitor, Palette, Key, Smartphone } from "lucide-react"
import { ShortcutKbd, ShortcutKbdGroup } from "@/components/shortcut-kbd"
import { cn } from "@/lib/utils"
import { ApiKeysManager } from "@/components/api-keys-manager"
import { PwaInstallManager } from "@/components/pwa-install-manager"
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
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)] w-[95vw] max-w-[95vw] h-[85vh] max-h-[85vh] sm:w-[820px] sm:max-w-[820px] sm:h-[620px] sm:max-h-[620px] overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle className="px-6 pt-6">Settings</DialogTitle>
          <DialogDescription className="px-6 pb-4">
            Configure your Troje experience
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid h-full min-h-0 gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <aside className="h-14 rounded-lg border bg-muted/20 p-2 md:h-auto">
            <nav className="flex h-full items-center gap-2 overflow-x-auto whitespace-nowrap md:h-auto md:flex-col md:items-stretch md:overflow-visible">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("appearance")}
                className={cn(
                  "h-9 justify-start gap-2 rounded-md",
                  section === "appearance" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Palette className="size-4" />
                Theme
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("keyboard")}
                className={cn(
                  "hidden h-9 justify-start gap-2 rounded-md md:flex",
                  section === "keyboard" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Keyboard className="size-4" />
                Keybindings
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("api")}
                className={cn(
                  "h-9 justify-start gap-2 rounded-md",
                  section === "api" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Key className="size-4" />
                API Keys
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSection("install")}
                className={cn(
                  "h-9 justify-start gap-2 rounded-md whitespace-nowrap md:hidden",
                  section === "install" && "bg-background shadow-sm text-foreground"
                )}
              >
                <Smartphone className="size-4" />
                Install App
              </Button>
            </nav>
          </aside>

          <section className="themed-scrollbar min-h-0 space-y-6 overflow-y-auto rounded-lg border bg-background/50 p-4 pr-3 sm:p-5 sm:pr-4">
            {section === "appearance" && (
              <div className="space-y-3">
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
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Keyboard className="size-4" />
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
                  <div className="space-y-0.5">
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

                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-medium">Shortcut Toggles</Label>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">New idea key</p>
                      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        <span>Quick capture shortcut</span>
                        <ShortcutKbdGroup hotkeys={SHORTCUTS.newIdea.hotkeys} className="flex-wrap justify-end" />
                      </div>
                    </div>
                    <Switch
                      checked={newIdeaKeyEnabled}
                      onCheckedChange={setNewIdeaKeyEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">Theme toggle key</p>
                      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        <span>Light/dark theme shortcut</span>
                        <ShortcutKbdGroup hotkeys={SHORTCUTS.toggleTheme.hotkeys} className="flex-wrap justify-end" />
                      </div>
                    </div>
                    <Switch
                      checked={themeToggleKeyEnabled}
                      onCheckedChange={setThemeToggleKeyEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">Settings key</p>
                      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        <span>Settings dialog shortcuts</span>
                        <ShortcutKbdGroup hotkeys={SHORTCUTS.settings.hotkeys} className="flex-wrap justify-end" />
                      </div>
                    </div>
                    <Switch
                      checked={settingsKeyEnabled}
                      onCheckedChange={setSettingsKeyEnabled}
                    />
                  </div>

                </div>

                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
                  <div className="grid gap-2 text-sm">
                    {[
                      SHORTCUTS.newIdea,
                      SHORTCUTS.toggleTheme,
                      SHORTCUTS.settings,
                      SHORTCUTS.help,
                      SHORTCUTS.inbox,
                      SHORTCUTS.archived,
                      SHORTCUTS.trash,
                      SHORTCUTS.navDown,
                      SHORTCUTS.navUp,
                      SHORTCUTS.navLeft,
                      SHORTCUTS.navRight,
                      SHORTCUTS.openActions,
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
