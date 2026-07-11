"use client"

import { useMemo } from "react"
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys"
import { SHORTCUTS } from "@/lib/shortcuts"

const COLUMN_COUNT = 3
const NO_SELECTION = -1

interface UseIdeaCardNavigationOptions {
  itemCount: number
  selectedIndex: number
  onSelect: (index: number) => void
  onAction?: (index: number) => void
  onNew?: () => void
  enabled?: boolean
}

export function useIdeaCardNavigation({
  itemCount,
  selectedIndex,
  onSelect,
  onAction,
  onNew,
  enabled = true,
}: UseIdeaCardNavigationOptions) {
  const hotkeys = useMemo<Array<UseHotkeyDefinition>>(() => {
    const hasItems = itemCount > 0
    const lastIndex = itemCount - 1
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
      onSelect(selectedIndex < lastIndex ? selectedIndex + 1 : 0)
    })

    register(SHORTCUTS.navUp, () => {
      if (!hasItems) return
      onSelect(selectedIndex > 0 ? selectedIndex - 1 : lastIndex)
    })

    register(SHORTCUTS.navLeft, () => {
      if (!hasItems) return
      onSelect(Math.max(0, selectedIndex - COLUMN_COUNT))
    })

    register(SHORTCUTS.navRight, () => {
      if (!hasItems) return
      onSelect(Math.min(lastIndex, selectedIndex + COLUMN_COUNT))
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
  }, [itemCount, onAction, onNew, onSelect, selectedIndex])

  useHotkeys(hotkeys, {
    enabled,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  return { selectedIndex }
}

export type { UseIdeaCardNavigationOptions }
