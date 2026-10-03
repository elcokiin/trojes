"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useSuppressGlobalHotkeys } from "@/hooks/use-hotkey-scope";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useDialogCloseHotkey } from "@/hooks/use-dialog-close-hotkey";
import { useSettingsNavHotkey } from "@/hooks/use-settings-nav-hotkey";
import { Dialog } from "@/components/ui/dialog";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SECTIONS,
  type SettingsSection,
} from "@/components/settings/settings-sections";

interface SettingsPageProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter();
  const [section, setSection] = useQueryState(
    "section",
    parseAsStringLiteral(SECTIONS),
  );
  const activeSection: SettingsSection = section ?? "api";
  const isMobile = useIsMobile();
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true
    );
  });

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setIsInstalled(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isMobile && section === "keyboard") {
      setSection("appearance", { scroll: false });
    }
  }, [isMobile, section, setSection]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  useScrollLock(true);
  useSuppressGlobalHotkeys(true);
  useDialogCloseHotkey(true, handleBack);

  const [keyboardEnabled] = useShortcutPreference("trojes-keyboard-nav");
  useHotkeys(
    [
      {
        hotkey: "Escape",
        callback: handleBack,
        options: { enabled: keyboardEnabled },
      },
    ],
    {
      ignoreInputs: true,
      preventDefault: true,
      stopPropagation: true,
    },
  );

  useSettingsNavHotkey(true, activeSection, setSection, isMobile, isInstalled);

  return (
    <Dialog open>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
        <SettingsPanel
          activeSection={activeSection}
          onSectionChange={setSection}
          isMobile={isMobile}
          isInstalled={isInstalled}
          isExpanded
          setIsExpanded={() => {}}
          showBackButton
          onClose={handleBack}
          user={user}
        />
      </div>
    </Dialog>
  );
}
