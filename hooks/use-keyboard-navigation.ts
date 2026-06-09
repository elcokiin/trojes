"use client"

import { useMemo } from "react"
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys"
import { SHORTCUTS } from "@/lib/shortcuts"

interface UseKeyboardNavigationOptions {
  itemCount: number
  selectedIndex: number
  onSelect: (index: number) => void
  onAction?: (index: number) => void
  onNew?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation({
  itemCount,
  selectedIndex,
  onSelect,
  onAction,
  onNew,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  const hotkeys = useMemo<Array<UseHotkeyDefinition>>(() => {
    const hasItems = itemCount > 0
    const registrations: Array<UseHotkeyDefinition> = [
      {
        hotkey: SHORTCUTS.navDown.hotkeys[0],
        callback: () => {
          if (!hasItems) return
          onSelect(selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0)
        },
      },
      {
        hotkey: SHORTCUTS.navDown.hotkeys[1],
        callback: () => {
          if (!hasItems) return
          onSelect(selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0)
        },
      },
      {
        hotkey: SHORTCUTS.navUp.hotkeys[0],
        callback: () => {
          if (!hasItems) return
          onSelect(selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1)
        },
      },
      {
        hotkey: SHORTCUTS.navUp.hotkeys[1],
        callback: () => {
          if (!hasItems) return
          onSelect(selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1)
        },
      },
      {
        hotkey: SHORTCUTS.navLeft.hotkeys[0],
        callback: () => {
          if (!hasItems) return
          onSelect(Math.max(0, selectedIndex - 3))
        },
      },
      {
        hotkey: SHORTCUTS.navLeft.hotkeys[1],
        callback: () => {
          if (!hasItems) return
          onSelect(Math.max(0, selectedIndex - 3))
        },
      },
      {
        hotkey: SHORTCUTS.navRight.hotkeys[0],
        callback: () => {
          if (!hasItems) return
          onSelect(Math.min(itemCount - 1, selectedIndex + 3))
        },
      },
      {
        hotkey: SHORTCUTS.navRight.hotkeys[1],
        callback: () => {
          if (!hasItems) return
          onSelect(Math.min(itemCount - 1, selectedIndex + 3))
        },
      },
      {
        hotkey: SHORTCUTS.deselect.hotkeys[0],
        callback: () => onSelect(-1),
      },
    ]

    if (onNew) {
      registrations.push({
        hotkey: SHORTCUTS.newIdea.hotkeys[0],
        callback: () => onNew(),
      })
    }

    if (onAction) {
      registrations.push({
        hotkey: SHORTCUTS.openActions.hotkeys[0],
        callback: () => {
          if (selectedIndex >= 0) onAction(selectedIndex)
        },
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
