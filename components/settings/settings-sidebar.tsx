"use client";

import { Key, Keyboard, Palette, Smartphone, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type SettingsSection =
  | "appearance"
  | "keyboard"
  | "api"
  | "install"
  | "account";

const sidebarItems = [
  {
    id: "install" as const,
    icon: Smartphone,
    label: "Install App",
    mobileOnly: true as const,
  },
  {
    id: "keyboard" as const,
    icon: Keyboard,
    label: "Keybindings",
    desktopOnly: true as const,
  },
  {
    id: "api" as const,
    icon: Key,
    label: "API Keys",
  },
  {
    id: "appearance" as const,
    icon: Palette,
    label: "Theme",
  },
  {
    id: "account" as const,
    icon: User,
    label: "Account",
  },
] as const;

interface SettingsSidebarProps {
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  isMobile: boolean;
  isInstalled: boolean;
}

export function SettingsSidebar({
  section,
  onSectionChange,
  isMobile,
  isInstalled,
}: SettingsSidebarProps) {
  return (
    <aside className="shrink-0 border-b bg-muted/20 md:w-64 md:border-b-0 md:border-r">
      <ScrollArea className="w-full md:h-full">
        <nav className="flex gap-1 p-3 overflow-x-auto md:overflow-visible md:flex-col">
          {sidebarItems.map((item) => {
            if (item.id === "install" && isInstalled) return null;
            if ("desktopOnly" in item && item.desktopOnly && isMobile)
              return null;
            if ("mobileOnly" in item && item.mobileOnly && !isMobile)
              return null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground md:w-full",
                  section === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <item.icon />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
