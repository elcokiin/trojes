"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { useRegisterHotkeyScope, selectNoDropdowns } from "@/hooks/use-hotkey-scope"
import { useUIStore } from "@/stores/ui-store"
import { useTheme } from "@/components/providers/theme-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Key,
  Keyboard,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Palette,
  LogOut,
  Smartphone,
  Sun,
  User,
} from "lucide-react"
import { IconTooltip } from "@/components/ui/icon-tooltip"
import { cn } from "@/lib/utils"
import { ApiKeysManager } from "@/components/settings/api-keys-manager"
import { PwaInstallManager } from "@/components/settings/pwa-install-manager"
import { SettingsKeyboard } from "@/components/settings/settings-keyboard"
import { SHORTCUTS } from "@/lib/shortcuts"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { useDialogCloseHotkey } from "@/hooks/use-dialog-close-hotkey"

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
  {
    id: "account",
    icon: User,
    label: "Account",
  },
] as const

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

type SettingsSection = "appearance" | "keyboard" | "api" | "install" | "account"

export function SettingsDialog({ open, onOpenChange, user }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [keyboardNav, setKeyboardNav] = useShortcutPreference("trojes-keyboard-nav")
  const [newIdeaKeyEnabled, setNewIdeaKeyEnabled] = useShortcutPreference("trojes-shortcut-new-idea")
  const [themeToggleKeyEnabled, setThemeToggleKeyEnabled] = useShortcutPreference("trojes-shortcut-theme-toggle")
  const [settingsKeyEnabled, setSettingsKeyEnabled] = useShortcutPreference("trojes-shortcut-settings")
  const [shortcutHintsEnabled, setShortcutHintsEnabled] = useShortcutPreference("trojes-shortcut-hints")
  const router = useRouter()
  const params = useSearchParams()
  const validSections: readonly string[] = ["appearance", "keyboard", "api", "install", "account"]
  const initialSection = validSections.includes(params.get("settings") || "")
    ? (params.get("settings") as SettingsSection)
    : "appearance"
  const [section, setSection] = useState<SettingsSection>(initialSection)
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("trojes-settings-expanded") === "true"
  })

  useRegisterHotkeyScope(!!open)

  useEffect(() => {
    localStorage.setItem("trojes-settings-expanded", String(isExpanded))
  }, [isExpanded])

  useEffect(() => {
    if (params.has("settings")) {
      onOpenChange?.(true)
    }
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (open) {
      url.searchParams.set("settings", section)
    } else {
      url.searchParams.delete("settings")
    }
    router.replace(url.pathname + url.search, { scroll: false })
  }, [open, section])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    setIsMobile(media.matches)
    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      setSection((prev) => e.matches && prev === "keyboard" ? "appearance" : prev)
    }

    media.addEventListener("change", onMediaChange)

    return () => media.removeEventListener("change", onMediaChange)
  }, [])

  const noDropdowns = useUIStore(selectNoDropdowns)

  useHotkey(SHORTCUTS.expandSettings.hotkeys[0], () => {
    onOpenChange?.(true)
    setIsExpanded((prev) => !prev)
  }, {
    enabled: settingsKeyEnabled && noDropdowns,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  useDialogCloseHotkey(!!open, () => onOpenChange?.(false))

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isMobile}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          isMobile
            ? "!fixed !inset-0 !z-50 !h-dvh !w-dvw !max-w-none !max-h-none !translate-x-0 !translate-y-0 !rounded-none !border-0 !shadow-none"
            : isExpanded
              ? "!h-[calc(100vh-2rem)] !max-h-[calc(100vh-2rem)] !w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] sm:!max-w-[calc(100vw-2rem)]"
              : "h-[min(720px,calc(100vh-2rem))] sm:max-w-4xl"
        )}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange?.(false)}
                aria-label="Go back"
                className="-ml-2"
              >
                <ArrowLeft />
              </Button>
            ) : (
              <IconTooltip
                icon={isExpanded ? <Minimize2 /> : <Maximize2 />}
                label={isExpanded ? "Collapse settings" : "Expand settings"}
                shortcut={SHORTCUTS.expandSettings.hotkeys[0]}
                side="top"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? "Restore settings dialog" : "Expand settings dialog"}
                className="-ml-2"
                size="icon"
              />
            )}
            <div className="min-w-0">
              <DialogTitle className="text-xl">Settings</DialogTitle>
              <DialogDescription>
                Configure your Trojes experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <aside className="shrink-0 border-b bg-muted/20 md:w-64 md:border-b-0 md:border-r">
            <ScrollArea className="w-full md:h-full">
              <nav className="flex gap-1 p-3 overflow-x-auto md:overflow-visible md:flex-col">
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
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="gap-2"
                      >
                        <Sun className="size-4" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="gap-2"
                      >
                        <Moon className="size-4" />
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
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
                  <SettingsKeyboard
                    keyboardNav={keyboardNav}
                    setKeyboardNav={setKeyboardNav}
                    shortcutHintsEnabled={shortcutHintsEnabled}
                    setShortcutHintsEnabled={setShortcutHintsEnabled}
                    newIdeaKeyEnabled={newIdeaKeyEnabled}
                    setNewIdeaKeyEnabled={setNewIdeaKeyEnabled}
                    themeToggleKeyEnabled={themeToggleKeyEnabled}
                    setThemeToggleKeyEnabled={setThemeToggleKeyEnabled}
                    settingsKeyEnabled={settingsKeyEnabled}
                    setSettingsKeyEnabled={setSettingsKeyEnabled}
                  />
                )}

                {section === "api" && <ApiKeysManager />}
                {isMobile && section === "install" && <PwaInstallManager />}

                {section === "account" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-14">
                        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex flex-col gap-1">
                        {user.name && (
                          <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                        )}
                        {user.email && (
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-fit gap-2 text-destructive hover:text-destructive"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </div>
                )}
              </section>
            </ScrollArea>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
