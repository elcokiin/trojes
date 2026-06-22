"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Keyboard } from "lucide-react"
import { ShortcutKbdGroup } from "@/components/shortcuts/shortcut-kbd"
import { SHORTCUTS } from "@/lib/shortcuts"

interface SettingsKeyboardProps {
  keyboardNav: boolean
  setKeyboardNav: (v: boolean) => void
  shortcutHintsEnabled: boolean
  setShortcutHintsEnabled: (v: boolean) => void
  newIdeaKeyEnabled: boolean
  setNewIdeaKeyEnabled: (v: boolean) => void
  themeToggleKeyEnabled: boolean
  setThemeToggleKeyEnabled: (v: boolean) => void
  settingsKeyEnabled: boolean
  setSettingsKeyEnabled: (v: boolean) => void
}

export function SettingsKeyboard({
  keyboardNav,
  setKeyboardNav,
  shortcutHintsEnabled,
  setShortcutHintsEnabled,
  newIdeaKeyEnabled,
  setNewIdeaKeyEnabled,
  themeToggleKeyEnabled,
  setThemeToggleKeyEnabled,
  settingsKeyEnabled,
  setSettingsKeyEnabled,
}: SettingsKeyboardProps) {
  return (
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
            SHORTCUTS.closeDialog,
            SHORTCUTS.inbox,
            SHORTCUTS.archived,
            SHORTCUTS.trash,
            SHORTCUTS.navDown,
            SHORTCUTS.navUp,
            SHORTCUTS.navLeft,
            SHORTCUTS.navRight,
            SHORTCUTS.openActions,
            SHORTCUTS.copyIdea,
            SHORTCUTS.togglePin,
            SHORTCUTS.togglePinnedTray,
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
  );
}
