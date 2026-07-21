"use client"

import { useMemo, useCallback } from "react"
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys"
import { SHORTCUTS } from "@/lib/shortcuts"
import { useUIStore } from "@/stores/ui-store"
import { selectNoOverlays } from "@/hooks/use-hotkey-scope"
import {
  navigateDown,
  navigateUp,
  navigateLeft,
  navigateRight,
} from "@/lib/column-layout"

const NO_SELECTION = -1

interface UseIdeaCardNavigationOptions {
  itemCount: number
  selectedIndex: number
  onSelect: (index: number) => void
  onAction?: (index: number) => void
  onNew?: () => void
  enabled?: boolean
  columnCount: number
}

export function useIdeaCardNavigation({
  itemCount,
  selectedIndex,
  onSelect,
  onAction,
  onNew,
  enabled = true,
  columnCount,
}: UseIdeaCardNavigationOptions) {
  const hotkeys = useMemo<Array<UseHotkeyDefinition>>(() => {
    const hasItems = itemCount > 0
    const registrations: Array<UseHotkeyDefinition> = []

    const register = (
      shortcut: (typeof SHORTCUTS)[keyof typeof SHORTCUTS],
      callback: () => void,
    ) => {
      for (const hotkey of shortcut.hotkeys) {
        registrations.push({ hotkey, callback })
      }
    }

    register(SHORTCUTS.navDown, () => {
      if (!hasItems) return
      const next = navigateDown(selectedIndex, columnCount, itemCount)
      if (next !== null) onSelect(next)
    })

    register(SHORTCUTS.navUp, () => {
      if (!hasItems) return
      const next = navigateUp(selectedIndex, columnCount, itemCount)
      if (next !== null) onSelect(next)
    })

    register(SHORTCUTS.navLeft, () => {
      if (!hasItems) return
      const next = navigateLeft(selectedIndex, columnCount, itemCount)
      if (next !== null) onSelect(next)
    })

    register(SHORTCUTS.navRight, () => {
      if (!hasItems) return
      const next = navigateRight(selectedIndex, columnCount, itemCount)
      if (next !== null) onSelect(next)
    })

    register(SHORTCUTS.deselect, () => onSelect(NO_SELECTION))

    if (onNew) {
      register(SHORTCUTS.newIdea, () => onNew())
    }

    if (onAction) {
      register(SHORTCUTS.openActions, () => {
        if (selectedIndex >= 0) onAction(selectedIndex)
      })
    }

    return registrations
  }, [itemCount, onAction, onNew, onSelect, selectedIndex, columnCount])

  const noOverlays = useUIStore(selectNoOverlays)

  useHotkeys(hotkeys, {
    enabled: enabled && noOverlays,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  return { selectedIndex }
}

export type { UseIdeaCardNavigationOptions }
