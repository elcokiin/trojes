"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Inbox,
  Trash2,
  Pin,
  PinOff,
  Palette,
  Check,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_COLORS } from "@/lib/ideas";
import type { Idea } from "@/types/idea";

interface IdeaCardMenuProps {
  idea: Pick<Idea, "id" | "pinned" | "status" | "background_color">;
  copied: boolean;
  showTrashInfo: boolean;
  onStatusChange: (newStatus: "inbox" | "archived" | "deleted") => void;
  onColorSelect: (colorId: string | null) => void;
  onPinToggle: () => void;
  onPermanentDelete: () => void;
  onCopy: () => void;
}

export function IdeaCardMenu({
  idea,
  copied,
  showTrashInfo,
  onStatusChange,
  onColorSelect,
  onPinToggle,
  onPermanentDelete,
  onCopy,
}: IdeaCardMenuProps) {
  return (
    <DropdownMenuContent
      align="end"
      className="w-48"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      {idea.status === "inbox" && (
        <DropdownMenuItem onClick={onPinToggle}>
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
      )}

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
                  type="button"
                  key={colorOption.id ?? "default"}
                  onClick={() => onColorSelect(colorOption.id)}
                  className={cn(
                    "size-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                    colorOption.id === null
                      ? "bg-card border-border"
                      : "border-transparent",
                    idea.background_color === colorOption.id &&
                      "ring-2 ring-primary ring-offset-1",
                  )}
                  style={
                    colorOption.id
                      ? { backgroundColor: `var(--card-color-${colorOption.id})` }
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

      <DropdownMenuItem onClick={onCopy}>
        {copied ? (
          <Check className="size-4 mr-2" />
        ) : (
          <Copy className="size-4 mr-2" />
        )}
        {copied ? "Copied!" : "Copy text"}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {idea.status !== "inbox" && (
        <DropdownMenuItem onClick={() => onStatusChange("inbox")}>
          <Inbox className="size-4 mr-2" />
          Move to Inbox
        </DropdownMenuItem>
      )}
      {idea.status !== "archived" && (
        <DropdownMenuItem onClick={() => onStatusChange("archived")}>
          <Archive className="size-4 mr-2" />
          Archive
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      {showTrashInfo && onPermanentDelete ? (
        <DropdownMenuItem
          onClick={onPermanentDelete}
          className="text-destructive focus:text-destructive"
        >
          <AlertTriangle className="size-4 mr-2" />
          Delete permanently
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          onClick={() => onStatusChange("deleted")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
}
