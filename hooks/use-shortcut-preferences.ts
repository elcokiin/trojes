"use client"

import { useEffect, useState } from "react"
import {
  readShortcutPreference,
  SHORTCUT_DEFAULTS,
  type ShortcutPreferenceKey,
  writeShortcutPreference,
} from "@/lib/shortcuts"

export function useShortcutPreference(key: ShortcutPreferenceKey) {
  const [enabled, setEnabled] = useState(SHORTCUT_DEFAULTS[key])

  useEffect(() => {
    setEnabled(readShortcutPreference(key))

    const handleChange = (event: Event) => {
      setEnabled((event as CustomEvent<boolean>).detail)
    }

    window.addEventListener(key, handleChange)
    return () => window.removeEventListener(key, handleChange)
  }, [key])

  const update = (nextEnabled: boolean) => {
    setEnabled(nextEnabled)
    writeShortcutPreference(key, nextEnabled)
  }

  return [enabled, update] as const
}
