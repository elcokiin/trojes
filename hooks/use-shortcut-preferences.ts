"use client"

import { useCallback } from "react"
import { useShortcutStore } from "@/stores/shortcut-store"
import type { ShortcutPreferenceKey } from "@/lib/shortcuts"

/**
 * Read and toggle a persisted shortcut preference.
 *
 * Thin wrapper over the shared `useShortcutStore`: the value is a single
 * source of truth, so every consumer stays in sync without broadcasting
 * window events, and persistence is handled by the store's persist middleware.
 */
export function useShortcutPreference(key: ShortcutPreferenceKey) {
  const enabled = useShortcutStore((s) => s.prefs[key])
  const setPreference = useShortcutStore((s) => s.setPreference)

  const update = useCallback(
    (nextEnabled: boolean) => setPreference(key, nextEnabled),
    [key, setPreference],
  )

  return [enabled, update] as const
}
