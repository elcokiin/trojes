"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { SHORTCUTS } from "@/lib/shortcuts";

interface SettingsHeaderProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobile: boolean;
  onClose: () => void;
}

export function SettingsHeader({
  isExpanded,
  setIsExpanded,
  isMobile,
  onClose,
}: SettingsHeaderProps) {
  return (
    <DialogHeader className="shrink-0 border-b px-6 py-4">
      <div className="flex items-start gap-3 pr-8">
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Go back"
            className="-ml-2"
          >
            <ArrowLeft />
          </Button>
        ) : (
          <IconTooltip
            icon={isExpanded ? <Minimize2 /> : <Maximize2 />}
            label={isExpanded ? "Collapse settings" : "Expand settings"}
            shortcut={SHORTCUTS.expandSettings.hotkeys[0]}
            side="top"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={
              isExpanded
                ? "Restore settings dialog"
                : "Expand settings dialog"
            }
            className="-ml-2"
            size="icon"
          />
        )}
        <div className="min-w-0">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Configure your Trojes experience
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
