"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { IdeaCard } from "@/components/ideas/idea-card"
import { QuickCapture } from "@/components/ideas/quick-capture"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useIdeaCardNavigation } from "@/hooks/use-idea-card-navigation"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"
import { useIdeas } from "@/hooks/use-ideas"
import { useInView } from "@/hooks/use-in-view"
import { useSearchStore } from "@/stores/search-store"
import { useUIStore } from "@/stores/ui-store"
import { Inbox, Archive, Trash2 } from "lucide-react"

function useColumnCount() {
  const [columnCount, setColumnCount] = useState(3)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumnCount(1)
      else if (width < 768) setColumnCount(2)
      else setColumnCount(3)
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  return columnCount
}

const SKELETON_COUNT = 3

const emptyState = {
  inbox: {
    icon: Inbox,
    title: "Your inbox is empty",
    description: "Press 'i' to capture a new idea",
  },
  archived: {
    icon: Archive,
    title: "No archived ideas",
    description: "Ideas you archive will appear here",
  },
  deleted: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Deleted ideas will appear here",
  },
}

const renderEmpty = (title: string, description: string, Icon: typeof Inbox) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon className="size-5" />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent />
  </Empty>
)

interface IdeasListProps {
  status: "inbox" | "archived" | "deleted"
  active?: boolean
  hideCapture?: boolean
}

export function IdeasList({ status, active = true, hideCapture = false }: IdeasListProps) {
  const [captureOpen, setCaptureOpen] = useState(false)
  const [keyboardEnabled] = useShortcutPreference("trojes-keyboard-nav")
  const [newIdeaKeyEnabled] = useShortcutPreference("trojes-shortcut-new-idea")
  const debouncedSearch = useSearchStore((s) => s.debouncedSearch)
  const focusIdeaId = useUIStore((s) => s.focusIdeaId)
  const storeSetCaptureOpen = useUIStore((s) => s.setCaptureOpen)
  const setFocusIdeaId = useUIStore((s) => s.setFocusIdeaId)

  const columnCount = useColumnCount()

  const {
    ideas,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    setSize,
    size,
    create,
    updateStatus,
    updatePin,
    updateColor,
    permanentDelete,
  } = useIdeas({ status, search: debouncedSearch, enabled: active })

  const sentinelOptions = useMemo(() => ({ rootMargin: "200px" }), [])
  const sentinel = useInView(sentinelOptions)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    if (sentinel.inView && hasMore && !isLoadingMore && !loadingMoreRef.current) {
      loadingMoreRef.current = true
      setSize(size + 1)
    }
    if (!isLoadingMore) loadingMoreRef.current = false
  }, [sentinel.inView, hasMore, isLoadingMore, setSize, size])

  const ideasRef = useRef(ideas)

  useEffect(() => {
    ideasRef.current = ideas
  }, [ideas])

  const selectedIndex = focusIdeaId
    ? ideas.findIndex((idea) => idea.id === focusIdeaId)
    : -1

  const handleSelect = useCallback((index: number) => {
    const id = index >= 0 && index < ideasRef.current.length
      ? ideasRef.current[index].id
      : null
    setFocusIdeaId(id)
  }, [setFocusIdeaId])

  const handleNew = useCallback(() => {
    if (status === "inbox") {
      storeSetCaptureOpen(true)
    }
  }, [status, storeSetCaptureOpen])

  useIdeaCardNavigation({
    itemCount: ideas.length,
    selectedIndex,
    onSelect: handleSelect,
    onNew: newIdeaKeyEnabled ? handleNew : undefined,
    enabled: active && keyboardEnabled && !captureOpen,
    columnCount,
  })

  const handleCapture = async (content: string) => {
    await create(content)
  }

  const handleCaptureClose = () => {
    setCaptureOpen(false)
  }

  const handleStatusChange = useCallback(async (id: string, newStatus: "inbox" | "archived" | "deleted") => {
    await updateStatus(id, newStatus)
    setFocusIdeaId(null)
  }, [updateStatus, setFocusIdeaId])

  const handlePinChange = useCallback(async (id: string, pinned: boolean) => {
    await updatePin(id, pinned)
  }, [updatePin])

  const handleColorChange = useCallback(async (id: string, background_color: string | null) => {
    await updateColor(id, background_color)
  }, [updateColor])

  const handlePermanentDelete = useCallback(async (id: string) => {
    await permanentDelete(id)
    setFocusIdeaId(null)
  }, [permanentDelete, setFocusIdeaId])

  const columns = useMemo(() => {
    const cols: Array<Array<{ idea: (typeof ideas)[0]; globalIndex: number }>> = Array.from(
      { length: columnCount },
      () => []
    )

    ideas.forEach((idea, globalIndex) => {
      const colIndex = globalIndex % columnCount
      cols[colIndex].push({ idea, globalIndex })
    })

    return cols
  }, [ideas, columnCount])

  const loadingColumns = useMemo(() => {
    const cols: number[][] = Array.from({ length: columnCount }, () => [])
    for (let i = 0; i < SKELETON_COUNT; i++) {
      cols[i % columnCount].push(i)
    }
    return cols
  }, [columnCount])

  if (isLoading) {
    return (
      <div className="flex gap-3 items-start">
        {loadingColumns.map((skeletons, colIdx) => (
          <div key={`loading-col-${colIdx}`} className="flex-1 flex flex-col gap-3 min-w-0">
            {skeletons.map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return renderEmpty(
      "Failed to load ideas",
      "There was an error loading your ideas. Please try again.",
      emptyState[status].icon
    )
  }

  const EmptyIcon = emptyState[status].icon

  return (
    <div className="space-y-6">
      {status === "inbox" && !hideCapture && (
        <QuickCapture
          onCapture={handleCapture}
          isOpen={captureOpen}
          onOpenChange={setCaptureOpen}
          onClose={handleCaptureClose}
        />
      )}

      {ideas.length === 0 ? (
        renderEmpty(
          emptyState[status].title,
          emptyState[status].description,
          EmptyIcon
        )
      ) : (
        <>
          <div className="flex gap-3 items-start">
            {columns.map((colIdeas, colIdx) => (
              <div key={`col-${colIdx}`} className="flex-1 flex flex-col gap-3 min-w-0">
                {colIdeas.map(({ idea, globalIndex }) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onStatusChange={handleStatusChange}
                    onPinChange={handlePinChange}
                    onColorChange={handleColorChange}
                    onPermanentDelete={status === "deleted" ? handlePermanentDelete : undefined}
                    isSelected={globalIndex === selectedIndex}
                    showTrashInfo={status === "deleted"}
                  />
                ))}
                {isLoadingMore &&
                  Array.from({ length: SKELETON_COUNT }, (_, s) => ({
                    globalIndex: ideas.length + s,
                    col: (ideas.length + s) % columnCount,
                  }))
                    .filter(({ col }) => col === colIdx)
                    .map(({ globalIndex }) => (
                      <Skeleton key={`skeleton-${globalIndex}`} className="h-24 w-full" />
                    ))}
              </div>
            ))}
          </div>

          {hasMore && <div ref={sentinel.ref} className="h-4" />}
        </>
      )}
    </div>
  )
}
