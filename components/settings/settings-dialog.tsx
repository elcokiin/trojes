"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useHotkeys } from "@tanstack/react-hotkeys";
import {
  useSuppressGlobalHotkeys,
  selectNoDropdowns,
} from "@/hooks/use-hotkey-scope";
import { useUIStore } from "@/stores/ui-store";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useDialogCloseHotkey } from "@/hooks/use-dialog-close-hotkey";
import { useSettingsNavHotkey } from "@/hooks/use-settings-nav-hotkey";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { SHORTCUTS } from "@/lib/shortcuts";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { DialogCloseButton } from "@/components/ui/custom/dialog-close-button";
import { cn } from "@/lib/utils";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SECTIONS } from "@/components/settings/settings-sections";

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsDialog({
  open: externalOpen,
  onOpenChange,
  user,
}: SettingsDialogProps) {
  const [section, setSection] = useQueryState("settings", parseAsStringLiteral(SECTIONS));

  const open = section !== null;
  const activeSection = section ?? "api";
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("trojes-settings-expanded") === "true";
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true
    );
  });

  useEffect(() => {
    localStorage.setItem("trojes-settings-expanded", String(isExpanded));
  }, [isExpanded]);

  const prevExternalOpen = useRef(externalOpen);
  useEffect(() => {
    if (prevExternalOpen.current !== externalOpen) {
      prevExternalOpen.current = externalOpen;
      if (externalOpen && section === null) {
        setSection("api", { scroll: false });
      } else if (!externalOpen && section !== null) {
        setSection(null, { scroll: false });
      }
    }
  }, [externalOpen, section, setSection]);

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current !== open) {
      prevOpen.current = open;
      onOpenChange?.(open);
    }
  }, [open, onOpenChange]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setSection((prev) =>
        e.matches && prev === "keyboard" ? "appearance" : prev,
      );
    };

    media.addEventListener("change", onMediaChange);

    return () => media.removeEventListener("change", onMediaChange);
  }, [setSection]);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setIsInstalled(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll when dialog is open to hide the global scrollbar
  useScrollLock(open);

  const [settingsKeyEnabled] = useShortcutPreference("trojes-shortcut-settings");
  const noDropdowns = useUIStore(selectNoDropdowns);
  useSuppressGlobalHotkeys(open);
  useHotkeys(
    SHORTCUTS.expandSettings.hotkeys.map((hotkey) => ({
      hotkey,
      callback: () => {
        setIsExpanded((prev) => !prev);
      },
      options: { enabled: open && settingsKeyEnabled && noDropdowns },
    })),
    {
      ignoreInputs: true,
      preventDefault: true,
      stopPropagation: true,
    },
  );
  useDialogCloseHotkey(open, () => onOpenChange?.(false));
  useSettingsNavHotkey(open, activeSection, setSection, isMobile, isInstalled);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSection("api", { scroll: false });
    } else {
      setSection(null, { scroll: false });
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          isMobile
            ? "fixed! inset-0! z-50! h-dvh! w-dvw! max-w-none! max-h-none! translate-x-0! translate-y-0! rounded-none! border-0! shadow-none"
            : isExpanded
              ? "fixed! inset-0! z-50! h-dvh! w-dvw! max-w-none! max-h-none! translate-x-0! translate-y-0! rounded-none! border-0! shadow-none"
              : "h-[min(720px,calc(100vh-2rem))] sm:max-w-4xl",
        )}
      >
        <SettingsPanel
          activeSection={activeSection}
          onSectionChange={setSection}
          isMobile={isMobile}
          isInstalled={isInstalled}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          onClose={() => handleOpenChange(false)}
          user={user}
        />
        {!isMobile && (
          <DialogCloseButton onClick={() => handleOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
