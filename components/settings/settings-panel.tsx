"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { SettingsAppearance } from "@/components/settings/settings-appearance";
import { SettingsAccount } from "@/components/settings/settings-account";
import { ApiKeysManager } from "@/components/settings/api-keys-manager";
import { PwaInstallManager } from "@/components/settings/pwa-install-manager";
import { SettingsKeyboard } from "@/components/settings/settings-keyboard";
import type { SettingsSection } from "@/components/settings/settings-sections";

interface SettingsPanelProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  isMobile: boolean;
  isInstalled: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  showBackButton?: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsPanel({
  activeSection,
  onSectionChange,
  isMobile,
  isInstalled,
  isExpanded,
  setIsExpanded,
  showBackButton,
  onClose,
  user,
}: SettingsPanelProps) {
  return (
    <>
      <SettingsHeader
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isMobile={isMobile}
        showBackButton={showBackButton}
        onClose={onClose}
      />
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col md:flex-row",
          isExpanded ? "overflow-visible" : "overflow-hidden",
        )}
      >
        <SettingsSidebar
          section={activeSection}
          onSectionChange={onSectionChange}
          isMobile={isMobile}
          isInstalled={isInstalled}
        />
        <div
          className={cn("min-h-0 flex-1 bg-background", isExpanded && "min-h-dvh")}
        >
          <ScrollArea className={cn("h-full", isExpanded && "h-dvh")}>
            <section className="flex flex-col gap-6 p-6">
              {activeSection === "appearance" && <SettingsAppearance />}
              {!isMobile && activeSection === "keyboard" && <SettingsKeyboard />}
              {activeSection === "api" && <ApiKeysManager />}
              {isMobile && activeSection === "install" && !isInstalled && (
                <PwaInstallManager />
              )}
              {activeSection === "account" && <SettingsAccount user={user} />}
            </section>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
