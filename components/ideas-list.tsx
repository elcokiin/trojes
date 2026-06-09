"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { IdeaCard, type Idea } from "@/components/idea-card"
import { QuickCapture } from "@/components/quick-capture"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import { Inbox, Archive, Trash2, Pin } from "lucide-react"
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences"

const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }

  return res.json()
}

interface IdeasListProps {
  status: "inbox" | "archived" | "deleted"
  onOpenCapture?: () => void
  active?: boolean
}

export function IdeasList({ status, onOpenCapture, active = true }: IdeasListProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [keyboardEnabled] = useShortcutPreference("brainbox-keyboard-nav")
  const [newIdeaKeyEnabled] = useShortcutPreference("brainbox-shortcut-new-idea")

  const { data, error, isLoading, mutate } = useSWR<{ ideas: Idea[] }>(
    `/api/ideas?status=${status}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const ideas = data?.ideas ?? []
  const pinnedIdeas = ideas.filter(idea => idea.pinned)
  const unpinnedIdeas = ideas.filter(idea => !idea.pinned)

  const handleNew = useCallback(() => {
    if (status === "inbox") {
      setCaptureOpen(true)
      onOpenCapture?.()
    }
  }, [status, onOpenCapture])

  useKeyboardNavigation({
    itemCount: ideas.length,
    selectedIndex,
    onSelect: setSelectedIndex,
    onNew: newIdeaKeyEnabled ? handleNew : undefined,
    enabled: active && keyboardEnabled && !captureOpen,
  })

  const handleCapture = async (content: string) => {
    const response = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (response.ok) {
      mutate()
    }
    setCaptureOpen(false)
  }

  const handleCaptureClose = () => {
    setCaptureOpen(false)
  }

  const handleStatusChange = async (id: string, newStatus: "inbox" | "archived" | "deleted") => {
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.filter((idea) => idea.id !== id),
        }
      },
      false
    )

    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })

    mutate()
    setSelectedIndex(-1)
  }

  const handlePinChange = async (id: string, pinned: boolean) => {
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.map((idea) =>
            idea.id === id ? { ...idea, pinned } : idea
          ),
        }
      },
      false
    )

    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    })

    mutate()
  }

  const handleColorChange = async (id: string, background_color: string | null) => {
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.map((idea) =>
            idea.id === id ? { ...idea, background_color } : idea
          ),
        }
      },
      false
    )

    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ background_color }),
    })

    mutate()
  }

  const handlePermanentDelete = async (id: string) => {
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ideas: currentData.ideas.filter((idea) => idea.id !== id),
        }
      },
      false
    )

    await fetch(`/api/ideas/${id}`, {
      method: "DELETE",
    })

    mutate()
    setSelectedIndex(-1)
  }

  const emptyState = {
    inbox: {
      icon: Inbox,
      title: "Your inbox is empty",
      description: "Press 'n' to capture a new idea",
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

  if (isLoading) {
    return (
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
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
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
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
      {status === "inbox" && (
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
        <div className="space-y-6">
          {pinnedIdeas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Pin className="size-3" />
                Pinned
              </div>
              {renderIdeas(pinnedIdeas, 0)}
            </div>
          )}
          
          {unpinnedIdeas.length > 0 && (
            <div className="space-y-3">
              {pinnedIdeas.length > 0 && (
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Others
                </div>
              )}
              {renderIdeas(unpinnedIdeas, pinnedIdeas.length)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
