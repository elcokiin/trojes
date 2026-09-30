"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUIStore } from "@/stores/ui-store";
import { SECTIONS } from "@/components/settings/settings-sections";

export function useMobileSettingsRoute() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const [section] = useQueryState(
    "settings",
    parseAsStringLiteral(SECTIONS),
  );

  useEffect(() => {
    if (!isMobile) return;
    if (!settingsOpen && section === null) return;
    setSettingsOpen(false);
    router.replace(`/settings?section=${section ?? "api"}`);
  }, [isMobile, settingsOpen, section, setSettingsOpen, router]);
}
