"use client";

import { useState, useEffect, useRef } from "react";
import copy from "copy-to-clipboard";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Archive,
  Inbox,
  Trash2,
  MessageSquare,
  Globe,
  Pin,
  PinOff,
  Palette,
  Check,
  AlertTriangle,
  Copy,
} from "lucide-react";
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

  const handleStatusChange = async (
    newStatus: "inbox" | "archived" | "deleted",
  ) => {
    setIsUpdating(true);
    onStatusChange(idea.id, newStatus);
    setIsUpdating(false);
    setMenuOpen(false);
  };

  const handlePinToggle = async () => {
    setIsUpdating(true);
    onPinChange(idea.id, !idea.pinned);
    setIsUpdating(false);
    setMenuOpen(false);
  };

  const handleColorSelect = async (colorId: string | null) => {
    setIsUpdating(true);
    onColorChange(idea.id, colorId);
    setIsUpdating(false);
  };

  const handlePermanentDelete = async () => {
    if (onPermanentDelete) {
      setIsUpdating(true);
      onPermanentDelete(idea.id);
      setIsUpdating(false);
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  useHotkey(SHORTCUTS.openActions.hotkeys[0], () => setMenuOpen(true), {
    enabled: isSelected,
    ignoreInputs: true,
    preventDefault: true,
    conflictBehavior: "allow",
  });

  useHotkey(
    SHORTCUTS.copyIdea.hotkeys[0],
    () => {
      copy(idea.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    {
      enabled: isSelected,
      ignoreInputs: true,
      preventDefault: true,
      conflictBehavior: "allow",
    },
  );

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
        side="left"
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
        side="left"
        onClick={() => {
          copy(idea.content);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={cn(
          "absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
          isSelected && "sm:opacity-100",
        )}
      />

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handlePinToggle}>
            {idea.pinned ? (
              <>
                <PinOff className="size-4 mr-2" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="size-4 mr-2" />
                Pin to top
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="size-4 mr-2" />
              Background color
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-2">
                <div className="grid grid-cols-6 gap-1.5">
                  {CARD_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.id ?? "default"}
                      onClick={() => handleColorSelect(colorOption.id)}
                      className={cn(
                        "size-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                        colorOption.id === null
                          ? "bg-card border-border"
                          : "border-transparent",
                        idea.background_color === colorOption.id &&
                          "ring-2 ring-primary ring-offset-1",
                      )}
                      style={
                        colorOption.color
                          ? { backgroundColor: colorOption.color }
                          : undefined
                      }
                      title={colorOption.name}
                    >
                      {idea.background_color === colorOption.id && (
                        <Check className="size-3 text-foreground/70" />
                      )}
                    </button>
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              copy(idea.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <Check className="size-4 mr-2" />
            ) : (
              <Copy className="size-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy text"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {idea.status !== "inbox" && (
            <DropdownMenuItem onClick={() => handleStatusChange("inbox")}>
              <Inbox className="size-4 mr-2" />
              Move to Inbox
            </DropdownMenuItem>
          )}
          {idea.status !== "archived" && (
            <DropdownMenuItem onClick={() => handleStatusChange("archived")}>
              <Archive className="size-4 mr-2" />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {showTrashInfo && onPermanentDelete ? (
            <DropdownMenuItem
              onClick={handlePermanentDelete}
              className="text-destructive focus:text-destructive"
            >
              <AlertTriangle className="size-4 mr-2" />
              Delete permanently
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleStatusChange("deleted")}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
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
