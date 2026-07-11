"use client"

import { useMemo, useEffect, useRef } from "react"
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys"
import { SHORTCUTS } from "@/lib/shortcuts"
import { useUIStore } from "@/stores/ui-store"

const NO_SELECTION = -1
const COLUMN_THRESHOLD = 20

interface UseIdeaCardNavigationOptions {
  itemCount: number
  selectedIndex: number
  onSelect: (index: number) => void
  onAction?: (index: number) => void
  onNew?: () => void
  enabled?: boolean
  containerNode: HTMLDivElement | null
}

function buildColumnMap(container: HTMLDivElement): number[][] {
  const children = Array.from(container.children)
  if (children.length === 0) return []

  const entries = children.map((child, i) => ({
    index: i,
    left: child.getBoundingClientRect().left,
  }))

  entries.sort((a, b) => a.left - b.left)

  const groups: number[][] = []
  let currentGroup: number[] = [entries[0].index]
  let currentLeft = entries[0].left

  for (let i = 1; i < entries.length; i++) {
    if (Math.abs(entries[i].left - currentLeft) < COLUMN_THRESHOLD) {
      currentGroup.push(entries[i].index)
    } else {
      groups.push(currentGroup)
      currentGroup = [entries[i].index]
      currentLeft = entries[i].left
    }
  }
  groups.push(currentGroup)

  return groups
}

export function useIdeaCardNavigation({
  itemCount,
  selectedIndex,
  onSelect,
  onAction,
  onNew,
  enabled = true,
  containerNode,
}: UseIdeaCardNavigationOptions) {
  const columnMapRef = useRef<number[][]>([])

  useEffect(() => {
    if (!containerNode) return

    const rebuild = () => {
      columnMapRef.current = buildColumnMap(containerNode)
    }

    rebuild()

    const ro = new ResizeObserver(rebuild)
    ro.observe(containerNode)

    return () => ro.disconnect()
  }, [containerNode])

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
      const map = columnMapRef.current
      const colIndex = map.findIndex((col) => col.includes(selectedIndex))
      if (colIndex <= 0) return
      const prevCol = map[colIndex - 1]
      const row = map[colIndex].indexOf(selectedIndex)
      onSelect(prevCol[Math.min(row, prevCol.length - 1)])
    })

    register(SHORTCUTS.navRight, () => {
      if (!hasItems) return
      const map = columnMapRef.current
      const colIndex = map.findIndex((col) => col.includes(selectedIndex))
      if (colIndex < 0 || colIndex >= map.length - 1) return
      const nextCol = map[colIndex + 1]
      const row = map[colIndex].indexOf(selectedIndex)
      onSelect(nextCol[Math.min(row, nextCol.length - 1)])
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

  const overlaysOpen = useUIStore((s) => s.overlaysOpen)

  useHotkeys(hotkeys, {
    enabled: enabled && overlaysOpen === 0,
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })

  return { selectedIndex }
}

export type { UseIdeaCardNavigationOptions }
