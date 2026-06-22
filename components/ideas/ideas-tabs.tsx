"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeasList } from "@/components/ideas/ideas-list";
import { Inbox, Archive, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShortcutKbd } from "@/components/shortcuts/shortcut-kbd";
import { SHORTCUTS } from "@/lib/shortcuts";
import type { RegisterableHotkey } from "@tanstack/react-hotkeys";
import { useUIStore } from "@/stores/ui-store";

type TabValue = "inbox" | "archived" | "deleted";

const TAB_VALUES: TabValue[] = ["inbox", "archived", "deleted"];

function isTabValue(v: string): v is TabValue {
  return TAB_VALUES.includes(v as TabValue);
}

interface TabConfig {
  value: TabValue
  label: string
  icon: typeof Archive
  shortcut: RegisterableHotkey
  mobileClasses: string
}

const TABS: TabConfig[] = [
  {
    value: "archived",
    label: "Archived",
    icon: Archive,
    shortcut: SHORTCUTS.archived.hotkeys[0],
    mobileClasses:
      "rounded-none border-0 border-r border-dashed border-muted-foreground data-[state=active]:border-l",
  },
  {
    value: "inbox",
    label: "Inbox",
    icon: Inbox,
    shortcut: SHORTCUTS.inbox.hotkeys[0],
    mobileClasses:
      "rounded-none border-0 data-[state=active]:border-x data-[state=active]:border-dashed data-[state=active]:border-muted-foreground",
  },
  {
    value: "deleted",
    label: "Trash",
    icon: Trash2,
    shortcut: SHORTCUTS.trash.hotkeys[0],
    mobileClasses:
      "rounded-none border-0 border-l border-dashed border-muted-foreground data-[state=active]:border-r",
  },
]

interface IdeasTabsProps {
  tabsClassName?: string;
  tabsListClassName?: string;
  triggerClassName?: string;
  tabsListWrapperClassName?: string;
  contentWrapperClassName?: string;
  showLabels?: boolean;
  hideCaptureInbox?: boolean;
  children?: ReactNode;
}

export function IdeasTabs({
  tabsClassName,
  tabsListClassName,
  triggerClassName,
  tabsListWrapperClassName,
  contentWrapperClassName,
  showLabels = true,
  hideCaptureInbox = false,
  children,
}: IdeasTabsProps) {
  const value = useUIStore((s) => s.activeTab)
  const onValueChange = useUIStore((s) => s.setActiveTab)
  const mobile = !showLabels;

  const tabsListContent = (
    <TabsList
      className={cn(
        tabsListClassName,
        mobile && "flex w-full rounded-none h-10",
      )}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              triggerClassName,
              "group",
              mobile && tab.mobileClasses,
            )}
          >
            {mobile ? (
              <Icon className="size-4" />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-center gap-1.5 flex-1 self-stretch">
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  <ShortcutKbd hotkey={tab.shortcut} />
                </TooltipContent>
              </Tooltip>
            )}
          </TabsTrigger>
        )
      })}
    </TabsList>
  );

  const onValueChangeHandler = (v: string) => onValueChange(v as TabValue)

  const tabsContent = (
    <>
      <TabsContent value="inbox">
        <IdeasList
          status="inbox"
          active={value === "inbox"}
          hideCapture={hideCaptureInbox}
        />
      </TabsContent>

      <TabsContent value="archived">
        <IdeasList status="archived" active={value === "archived"} />
      </TabsContent>

      <TabsContent value="deleted">
        <IdeasList status="deleted" active={value === "deleted"} />
      </TabsContent>
    </>
  );

  return (
    <Tabs
      value={value}
      onValueChange={onValueChangeHandler}
      className={tabsClassName}
    >
      {tabsListWrapperClassName ? (
        <div className={tabsListWrapperClassName}>
          {children}
          {tabsListContent}
        </div>
      ) : (
        <>
          {children}
          {tabsListContent}
        </>
      )}

      {contentWrapperClassName ? (
        <div className={contentWrapperClassName}>{tabsContent}</div>
      ) : (
        tabsContent
      )}
    </Tabs>
  );
}
