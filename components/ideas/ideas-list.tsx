"use client"

import { useState, useCallback, useRef } from "react"
import { IdeaCard } from "@/components/ideas/idea-card"
import type { Idea } from "@/types/idea"
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
import { useSearchStore } from "@/stores/search-store"
import { useUIStore } from "@/stores/ui-store"
import { Inbox, Archive, Trash2 } from "lucide-react"

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
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null)
  const [keyboardEnabled] = useShortcutPreference("trojes-keyboard-nav")
  const [newIdeaKeyEnabled] = useShortcutPreference("trojes-shortcut-new-idea")
  const debouncedSearch = useSearchStore((s) => s.debouncedSearch)
  const focusIdeaId = useUIStore((s) => s.focusIdeaId)
  const storeSetCaptureOpen = useUIStore((s) => s.setCaptureOpen)
  const setFocusIdeaId = useUIStore((s) => s.setFocusIdeaId)

  const {
    ideas,
    error,
    isLoading,
    create,
    updateStatus,
    updatePin,
    updateColor,
    permanentDelete,
  } = useIdeas({ status, search: debouncedSearch, enabled: active })

  const ideasRef = useRef(ideas)
  ideasRef.current = ideas

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
    containerNode,
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

  if (isLoading) {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-24 w-full break-inside-avoid" />
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

  const renderIdeas = (ideaList: Idea[], startIndex: number) => (
    <div ref={setContainerNode} className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
      {ideaList.map((idea, index) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onStatusChange={handleStatusChange}
          onPinChange={handlePinChange}
          onColorChange={handleColorChange}
          onPermanentDelete={status === "deleted" ? handlePermanentDelete : undefined}
          isSelected={startIndex + index === selectedIndex}
          showTrashInfo={status === "deleted"}
        />
      ))}
    </div>
  )

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
        renderIdeas(ideas, 0)
      )}
    </div>
  )
}
