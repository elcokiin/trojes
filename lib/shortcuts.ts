"use client"

import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

export type ShortcutPreferenceKey =
  | "trojes-keyboard-nav"
  | "trojes-shortcut-new-idea"
  | "trojes-shortcut-theme-toggle"
  | "trojes-shortcut-settings"
  | "trojes-shortcut-hints"

export type ShortcutId =
  | "newIdea"
  | "toggleTheme"
  | "settings"
  | "expandSettings"
  | "help"
  | "inbox"
  | "archived"
  | "trash"
  | "navDown"
  | "navUp"
  | "navLeft"
  | "navRight"
  | "openActions"
  | "deselect"
  | "closeDialog"
  | "saveCapture"
  | "cancelCapture"
  | "toggleSidebar"
  | "copyIdea"
  | "togglePin"
  | "togglePinnedTray"

export interface ShortcutDefinition {
  id: ShortcutId
  label: string
  hotkeys: RegisterableHotkey[]
  category: "Capture" | "Navigation" | "Views" | "System" | "Editing"
  preferenceKey?: ShortcutPreferenceKey
}

export const SHORTCUT_DEFAULTS: Record<ShortcutPreferenceKey, boolean> = {
  "trojes-keyboard-nav": true,
  "trojes-shortcut-new-idea": true,
  "trojes-shortcut-theme-toggle": true,
  "trojes-shortcut-settings": true,
  "trojes-shortcut-hints": true,
}

export const SHORTCUTS = {
  newIdea: {
    id: "newIdea",
    label: "New idea",
    hotkeys: ["I"],
    category: "Capture",
    preferenceKey: "trojes-shortcut-new-idea",
  },
  toggleTheme: {
    id: "toggleTheme",
    label: "Toggle theme",
    hotkeys: ["D"],
    category: "System",
    preferenceKey: "trojes-shortcut-theme-toggle",
  },
  settings: {
    id: "settings",
    label: "Settings",
    hotkeys: ["S", ","],
    category: "System",
    preferenceKey: "trojes-shortcut-settings",
  },
  expandSettings: {
    id: "expandSettings",
    label: "Expand settings dialog",
    hotkeys: ["Mod+E"],
    category: "System",
    preferenceKey: "trojes-shortcut-settings",
  },
  help: {
    id: "help",
    label: "Shortcut help",
    hotkeys: [{ key: "/", shift: true }],
    category: "System",
  },
  inbox: {
    id: "inbox",
    label: "Inbox",
    hotkeys: ["Mod+2"],
    category: "Views",
    preferenceKey: "trojes-keyboard-nav",
  },
  archived: {
    id: "archived",
    label: "Archived",
    hotkeys: ["Mod+1"],
    category: "Views",
    preferenceKey: "trojes-keyboard-nav",
  },
  trash: {
    id: "trash",
    label: "Trash",
    hotkeys: ["Mod+3"],
    category: "Views",
    preferenceKey: "trojes-keyboard-nav",
  },
  navDown: {
    id: "navDown",
    label: "Navigate down",
    hotkeys: ["J", "ArrowDown"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  navUp: {
    id: "navUp",
    label: "Navigate up",
    hotkeys: ["K", "ArrowUp"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  navLeft: {
    id: "navLeft",
    label: "Navigate left",
    hotkeys: ["H", "ArrowLeft"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  navRight: {
    id: "navRight",
    label: "Navigate right",
    hotkeys: ["L", "ArrowRight"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  openActions: {
    id: "openActions",
    label: "Open actions",
    hotkeys: ["Enter"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  copyIdea: {
    id: "copyIdea",
    label: "Copy idea text",
    hotkeys: ["C"],
    category: "Editing",
  },
  togglePin: {
    id: "togglePin",
    label: "Toggle pin",
    hotkeys: [{ key: "P", shift: true }],
    category: "Editing",
  },
  togglePinnedTray: {
    id: "togglePinnedTray",
    label: "Toggle pinned tray",
    hotkeys: ["P"],
    category: "Views",
  },
  deselect: {
    id: "deselect",
    label: "Deselect",
    hotkeys: ["Escape"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  closeDialog: {
    id: "closeDialog",
    label: "Close dialog",
    hotkeys: ["Q"],
    category: "Navigation",
    preferenceKey: "trojes-keyboard-nav",
  },
  saveCapture: {
    id: "saveCapture",
    label: "Save capture",
    hotkeys: ["Mod+Enter"],
    category: "Editing",
  },
  cancelCapture: {
    id: "cancelCapture",
    label: "Cancel capture",
    hotkeys: ["Escape"],
    category: "Editing",
  },
  toggleSidebar: {
    id: "toggleSidebar",
    label: "Toggle sidebar",
    hotkeys: ["Mod+B"],
    category: "System",
  },
} satisfies Record<string, ShortcutDefinition>

export const SHORTCUT_GROUPS = ["Capture", "Navigation", "Views", "System", "Editing"] as const

export function readShortcutPreference(key: ShortcutPreferenceKey) {
  if (typeof window === "undefined") return SHORTCUT_DEFAULTS[key]

  const stored = window.localStorage.getItem(key)
  if (stored !== null) return stored === "true"

  return SHORTCUT_DEFAULTS[key]
}

export function writeShortcutPreference(key: ShortcutPreferenceKey, enabled: boolean) {
  window.localStorage.setItem(key, String(enabled))
  window.dispatchEvent(new CustomEvent(key, { detail: enabled }))
}
