"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeasList } from "@/components/ideas/ideas-list";
import { Inbox, Archive, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

type TabValue = "inbox" | "archived" | "deleted";

interface IdeasTabsProps {
  value: TabValue;
  onValueChange: (value: TabValue) => void;
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
  value,
  onValueChange,
  tabsClassName,
  tabsListClassName,
  triggerClassName,
  tabsListWrapperClassName,
  contentWrapperClassName,
  showLabels = true,
  hideCaptureInbox = false,
  children,
}: IdeasTabsProps) {
  const tabsListContent = (
    <TabsList className={tabsListClassName}>
      <TabsTrigger value="inbox" className={triggerClassName}>
        <Inbox className="size-4" />
        {showLabels && <span className="hidden sm:inline">Inbox</span>}
      </TabsTrigger>
      <TabsTrigger value="archived" className={triggerClassName}>
        <Archive className="size-4" />
        {showLabels && <span className="hidden sm:inline">Archived</span>}
      </TabsTrigger>
      <TabsTrigger value="deleted" className={triggerClassName}>
        <Trash2 className="size-4" />
        {showLabels && <span className="hidden sm:inline">Trash</span>}
      </TabsTrigger>
    </TabsList>
  );

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
      onValueChange={(v) => onValueChange(v as TabValue)}
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
