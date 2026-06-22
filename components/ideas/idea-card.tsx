"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  MessageSquare,
  Globe,
  Pin,
  PinOff,
  Trash2,
  Check,
  Copy,
} from "lucide-react";
import { IdeaCardMenu } from "@/components/ideas/idea-card-menu";
import { cn } from "@/lib/utils";
import { SHORTCUTS } from "@/lib/shortcuts";
import {
  CARD_COLORS,
  formatTimeInTrash,
  formatRelativeDate,
} from "@/lib/ideas";
import type { IdeaCardProps } from "@/types/idea";

export function IdeaCard({
  idea,
  onStatusChange,
  onPinChange,
  onColorChange,
  onPermanentDelete,
  isSelected = false,
  showTrashInfo = false,
}: IdeaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMenuOpenChange = useCallback((open: boolean) => {
    if (!open && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMenuOpen(open);
  }, []);

  const handleStatusChange = async (
    newStatus: "inbox" | "archived" | "deleted",
  ) => {
    setIsUpdating(true);
    try {
      await onStatusChange(idea.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
    setMenuOpen(false);
  };

  const handlePinToggle = async () => {
    setIsUpdating(true);
    try {
      await onPinChange(idea.id, !idea.pinned);
    } finally {
      setIsUpdating(false);
    }
    setMenuOpen(false);
  };

  const handleColorSelect = async (colorId: string | null) => {
    setIsUpdating(true);
    try {
      await onColorChange(idea.id, colorId);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (onPermanentDelete) {
      setIsUpdating(true);
      try {
        await onPermanentDelete(idea.id);
      } finally {
        setIsUpdating(false);
      }
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  useHotkey(SHORTCUTS.openActions.hotkeys[0], () => setMenuOpen(true), {
    enabled: isSelected && !menuOpen,
    ignoreInputs: true,
    preventDefault: true,
    conflictBehavior: "allow",
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(idea.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [idea.content]);

  useHotkey(SHORTCUTS.copyIdea.hotkeys[0], handleCopy, {
    enabled: isSelected,
    ignoreInputs: true,
    preventDefault: true,
    conflictBehavior: "allow",
  });

  useHotkey(
    SHORTCUTS.togglePin.hotkeys[0],
    () => {
      handlePinToggle();
    },
    {
      enabled: isSelected,
      ignoreInputs: true,
      preventDefault: true,
      conflictBehavior: "allow",
    },
  );

  const selectedColor = CARD_COLORS.find((c) => c.id === idea.background_color);
  const cardStyle = selectedColor?.color
    ? { backgroundColor: selectedColor.color }
    : undefined;

  return (
    <Card
      ref={cardRef}
      style={cardStyle}
      className={cn(
        "group transition-all duration-200 hover:shadow-md break-inside-avoid relative",
        isUpdating && "opacity-50 pointer-events-none",
        isSelected &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background",
        idea.background_color && "border-transparent",
      )}
    >
      <IconTooltip
        icon={
          idea.pinned ? (
            <PinOff className="size-3.5" />
          ) : (
            <Pin className="size-3.5" />
          )
        }
        label={idea.pinned ? "Unpin" : "Pin to top"}
        shortcut={SHORTCUTS.togglePin.hotkeys[0]}
        side="top"
        onClick={handlePinToggle}
        className={cn(
          "absolute top-2 right-10 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
          idea.pinned && "text-primary sm:opacity-100",
          isSelected && "sm:opacity-100",
        )}
      />

      <IconTooltip
        icon={
          copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )
        }
        label="Copy text"
        shortcut={SHORTCUTS.copyIdea.hotkeys[0]}
        side="top"
        onClick={handleCopy}
        className={cn(
          "absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
          isSelected && "sm:opacity-100",
        )}
      />

      <DropdownMenu open={menuOpen} onOpenChange={handleMenuOpenChange}>
        <IdeaCardMenu
          idea={idea}
          copied={copied}
          showTrashInfo={showTrashInfo}
          onStatusChange={handleStatusChange}
          onColorSelect={handleColorSelect}
          onPinToggle={handlePinToggle}
          onPermanentDelete={handlePermanentDelete}
          onCopy={handleCopy}
        />
        <CardContent className="pt-2 pl-4 pr-10">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-words">
              {idea.content}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {idea.source === "telegram" ? (
                  <MessageSquare className="size-3" />
                ) : (
                  <Globe className="size-3" />
                )}
                {showTrashInfo && idea.deleted_at ? (
                  <span className="text-destructive/70 flex items-center gap-1">
                    <Trash2 className="size-3" />
                    {formatTimeInTrash(idea.deleted_at)}
                  </span>
                ) : (
                  <span>{formatRelativeDate(idea.created_at)}</span>
                )}
                {idea.pinned && <Pin className="size-3 text-primary" />}
              </div>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "size-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity -mr-1.5",
                    isSelected && "opacity-100",
                  )}
                >
                  <IconTooltip
                    icon={<MoreHorizontal className="size-3.5" />}
                    label="More actions"
                    shortcut={SHORTCUTS.openActions.hotkeys[0]}
                    side="top"
                    asChild
                  />
                </Button>
              </DropdownMenuTrigger>
            </div>
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {idea.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-1.5 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </DropdownMenu>
    </Card>
  );
}
