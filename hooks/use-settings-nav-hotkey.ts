"use client";

import { useMemo, useRef } from "react";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { SHORTCUTS } from "@/lib/shortcuts";

type SettingsSection =
  | "appearance"
  | "keyboard"
  | "api"
  | "install"
  | "account";

/**
 * Order matches the sidebar rendering order in SettingsSidebar.
 */
const ALL_SECTIONS: SettingsSection[] = [
  "install",
  "keyboard",
  "api",
  "appearance",
  "account",
];

function getVisibleSections(
  isMobile: boolean,
  isInstalled: boolean,
): SettingsSection[] {
  return ALL_SECTIONS.filter((id) => {
    if (id === "install") return isMobile && !isInstalled;
    if (id === "keyboard") return !isMobile;
    return true;
  });
}

export function useSettingsNavHotkey(
  open: boolean,
  activeSection: string,
  onSectionChange: (section: SettingsSection) => void,
  isMobile: boolean,
  isInstalled: boolean,
) {
  const [keyboardEnabled] = useShortcutPreference("trojes-keyboard-nav");

  const visibleSections = useMemo(
    () => getVisibleSections(isMobile, isInstalled),
    [isMobile, isInstalled],
  );

  // Use refs so callbacks always read the latest values
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;

  const visibleSectionsRef = useRef(visibleSections);
  visibleSectionsRef.current = visibleSections;

  const enabled = open && keyboardEnabled && visibleSections.length > 1;

  useHotkeys(
    [
      ...SHORTCUTS.settingsSectionNext.hotkeys.map((hotkey) => ({
        hotkey,
        callback: () => {
          const sections = visibleSectionsRef.current;
          const current = activeSectionRef.current as SettingsSection;
          const idx = sections.indexOf(current);
          if (idx === -1) return;
          onSectionChange(sections[(idx + 1) % sections.length]);
        },
      })),
      ...SHORTCUTS.settingsSectionPrev.hotkeys.map((hotkey) => ({
        hotkey,
        callback: () => {
          const sections = visibleSectionsRef.current;
          const current = activeSectionRef.current as SettingsSection;
          const idx = sections.indexOf(current);
          if (idx === -1) return;
          onSectionChange(
            sections[(idx - 1 + sections.length) % sections.length],
          );
        },
      })),
    ],
    {
      enabled,
      ignoreInputs: true,
      preventDefault: true,
      stopPropagation: true,
    },
  );
}