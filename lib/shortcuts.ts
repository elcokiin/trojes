"use client"

import type { RegisterableHotkey } from "@tanstack/react-hotkeys"

export type ShortcutPreferenceKey =
  | "troje-keyboard-nav"
  | "troje-shortcut-new-idea"
  | "troje-shortcut-theme-toggle"
  | "troje-shortcut-settings"
  | "troje-shortcut-hints"

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
  | "saveCapture"
  | "cancelCapture"
  | "toggleSidebar"
  | "copyIdea"
  | "togglePin"

export interface ShortcutDefinition {
  id: ShortcutId
  label: string
  hotkeys: RegisterableHotkey[]
  category: "Capture" | "Navigation" | "Views" | "System" | "Editing"
  preferenceKey?: ShortcutPreferenceKey
}

export const SHORTCUT_DEFAULTS: Record<ShortcutPreferenceKey, boolean> = {
  "troje-keyboard-nav": true,
  "troje-shortcut-new-idea": true,
  "troje-shortcut-theme-toggle": true,
  "troje-shortcut-settings": true,
  "troje-shortcut-hints": true,
}

const LEGACY_SHORTCUT_KEYS: Record<ShortcutPreferenceKey, string> = {
  "troje-keyboard-nav": "brainbox-keyboard-nav",
  "troje-shortcut-new-idea": "brainbox-shortcut-new-idea",
  "troje-shortcut-theme-toggle": "brainbox-shortcut-theme-toggle",
  "troje-shortcut-settings": "brainbox-shortcut-settings",
  "troje-shortcut-hints": "brainbox-shortcut-hints",
}

export const SHORTCUTS = {
  newIdea: {
    id: "newIdea",
    label: "New idea",
    hotkeys: ["N"],
    category: "Capture",
    preferenceKey: "troje-shortcut-new-idea",
  },
  toggleTheme: {
    id: "toggleTheme",
    label: "Toggle theme",
    hotkeys: ["D"],
    category: "System",
    preferenceKey: "troje-shortcut-theme-toggle",
  },
  settings: {
    id: "settings",
    label: "Settings",
    hotkeys: ["S", ","],
    category: "System",
    preferenceKey: "troje-shortcut-settings",
  },
  expandSettings: {
    id: "expandSettings",
    label: "Expand settings dialog",
    hotkeys: ["Mod+E"],
    category: "System",
    preferenceKey: "troje-shortcut-settings",
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
    preferenceKey: "troje-keyboard-nav",
  },
  archived: {
    id: "archived",
    label: "Archived",
    hotkeys: ["Mod+1"],
    category: "Views",
    preferenceKey: "troje-keyboard-nav",
  },
  trash: {
    id: "trash",
    label: "Trash",
    hotkeys: ["Mod+3"],
    category: "Views",
    preferenceKey: "troje-keyboard-nav",
  },
  navDown: {
    id: "navDown",
    label: "Navigate down",
    hotkeys: ["J", "ArrowDown"],
    category: "Navigation",
    preferenceKey: "troje-keyboard-nav",
  },
  navUp: {
    id: "navUp",
    label: "Navigate up",
    hotkeys: ["K", "ArrowUp"],
    category: "Navigation",
    preferenceKey: "troje-keyboard-nav",
  },
  navLeft: {
    id: "navLeft",
    label: "Navigate left",
    hotkeys: ["H", "ArrowLeft"],
    category: "Navigation",
    preferenceKey: "troje-keyboard-nav",
  },
  navRight: {
    id: "navRight",
    label: "Navigate right",
    hotkeys: ["L", "ArrowRight"],
    category: "Navigation",
    preferenceKey: "troje-keyboard-nav",
  },
  openActions: {
    id: "openActions",
    label: "Open actions",
    hotkeys: ["Enter"],
    category: "Navigation",
    preferenceKey: "troje-keyboard-nav",
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
    hotkeys: ["P"],
    category: "Editing",
  },
  deselect: {
    id: "deselect",
    label: "Deselect",
    hotkeys: ["Escape"],
    category: "Navigation",
    preferenceKey: "troje-keyboard-nav",
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

  const legacyStored = window.localStorage.getItem(LEGACY_SHORTCUT_KEYS[key])
  if (legacyStored !== null) {
    window.localStorage.setItem(key, legacyStored)
    return legacyStored === "true"
  }

  return SHORTCUT_DEFAULTS[key]
}

export function writeShortcutPreference(key: ShortcutPreferenceKey, enabled: boolean) {
  window.localStorage.setItem(key, String(enabled))
  window.dispatchEvent(new CustomEvent(key, { detail: enabled }))
}
