"use client"

import type { Hotkey } from "@tanstack/react-hotkeys"

export type ShortcutPreferenceKey =
  | "brainbox-keyboard-nav"
  | "brainbox-shortcut-new-idea"
  | "brainbox-shortcut-theme-toggle"
  | "brainbox-shortcut-settings"

export type ShortcutId =
  | "newIdea"
  | "toggleTheme"
  | "settings"
  | "settingsAlt"
  | "help"
  | "inbox"
  | "archived"
  | "trash"
  | "navDown"
  | "navDownArrow"
  | "navUp"
  | "navUpArrow"
  | "navLeft"
  | "navLeftArrow"
  | "navRight"
  | "navRightArrow"
  | "openActions"
  | "deselect"
  | "saveCapture"
  | "cancelCapture"
  | "toggleSidebar"

export interface ShortcutDefinition {
  id: ShortcutId
  label: string
  hotkeys: Hotkey[]
  category: "Capture" | "Navigation" | "Views" | "System" | "Editing"
  preferenceKey?: ShortcutPreferenceKey
}

export const SHORTCUT_DEFAULTS: Record<ShortcutPreferenceKey, boolean> = {
  "brainbox-keyboard-nav": true,
  "brainbox-shortcut-new-idea": true,
  "brainbox-shortcut-theme-toggle": true,
  "brainbox-shortcut-settings": true,
}

export const SHORTCUTS = {
  newIdea: {
    id: "newIdea",
    label: "New idea",
    hotkeys: ["N"],
    category: "Capture",
    preferenceKey: "brainbox-shortcut-new-idea",
  },
  toggleTheme: {
    id: "toggleTheme",
    label: "Toggle theme",
    hotkeys: ["D"],
    category: "System",
    preferenceKey: "brainbox-shortcut-theme-toggle",
  },
  settings: {
    id: "settings",
    label: "Settings",
    hotkeys: ["P", ","],
    category: "System",
    preferenceKey: "brainbox-shortcut-settings",
  },
  help: {
    id: "help",
    label: "Shortcut help",
    hotkeys: ["F1"],
    category: "System",
  },
  inbox: {
    id: "inbox",
    label: "Inbox",
    hotkeys: ["Mod+1"],
    category: "Views",
    preferenceKey: "brainbox-keyboard-nav",
  },
  archived: {
    id: "archived",
    label: "Archived",
    hotkeys: ["Mod+2"],
    category: "Views",
    preferenceKey: "brainbox-keyboard-nav",
  },
  trash: {
    id: "trash",
    label: "Trash",
    hotkeys: ["Mod+3"],
    category: "Views",
    preferenceKey: "brainbox-keyboard-nav",
  },
  navDown: {
    id: "navDown",
    label: "Navigate down",
    hotkeys: ["J", "ArrowDown"],
    category: "Navigation",
    preferenceKey: "brainbox-keyboard-nav",
  },
  navUp: {
    id: "navUp",
    label: "Navigate up",
    hotkeys: ["K", "ArrowUp"],
    category: "Navigation",
    preferenceKey: "brainbox-keyboard-nav",
  },
  navLeft: {
    id: "navLeft",
    label: "Navigate left",
    hotkeys: ["H", "ArrowLeft"],
    category: "Navigation",
    preferenceKey: "brainbox-keyboard-nav",
  },
  navRight: {
    id: "navRight",
    label: "Navigate right",
    hotkeys: ["L", "ArrowRight"],
    category: "Navigation",
    preferenceKey: "brainbox-keyboard-nav",
  },
  openActions: {
    id: "openActions",
    label: "Open actions",
    hotkeys: ["Enter"],
    category: "Navigation",
    preferenceKey: "brainbox-keyboard-nav",
  },
  deselect: {
    id: "deselect",
    label: "Deselect",
    hotkeys: ["Escape"],
    category: "Navigation",
    preferenceKey: "brainbox-keyboard-nav",
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
  return stored === null ? SHORTCUT_DEFAULTS[key] : stored === "true"
}

export function writeShortcutPreference(key: ShortcutPreferenceKey, enabled: boolean) {
  window.localStorage.setItem(key, String(enabled))
  window.dispatchEvent(new CustomEvent(key, { detail: enabled }))
}
