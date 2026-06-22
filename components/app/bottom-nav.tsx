"use client";

import { Pin, Search, Settings, X } from "lucide-react";
import type { RefObject } from "react";
import { Kbd } from "@/components/ui/kbd";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SearchState {
  searchMode: boolean;
  setSearchMode: (mode: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  handleCloseSearch: () => void;
  handleXClick: () => void;
}

interface BottomNavProps {
  onSettingsOpen: () => void;
  search: SearchState;
}

export function BottomNav({ onSettingsOpen, search }: BottomNavProps) {
  const isMobile = useIsMobile();
  const [showShortcutHints] = useShortcutPreference("troje-shortcut-hints");
  const {
    searchMode,
    setSearchMode,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    handleCloseSearch,
    handleXClick,
  } = search;

  return (
    <nav className="shrink-0 h-12 border-t bg-background flex items-stretch">
      {searchMode ? (
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find your ideas..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCloseSearch();
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={handleXClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={searchQuery ? "Clear search" : "Close search"}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : isMobile ? (
        <>
          <button className="flex items-center justify-center text-muted-foreground px-4">
            <Pin className="size-4" />
          </button>
          <button
            onClick={() => setSearchMode(true)}
            className="flex-1 flex items-center justify-center text-muted-foreground border-x border-dashed border-muted-foreground h-full"
          >
            <span className="text-xs font-bold tracking-widest">SEARCH</span>
          </button>
          <button
            onClick={onSettingsOpen}
            className="flex items-center justify-center text-muted-foreground px-4"
          >
            <Settings className="size-4" />
          </button>
        </>
      ) : (
        <>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground h-full">
            <Pin className="size-4" />
            <span className="text-sm font-medium">Pin</span>
            {showShortcutHints && <Kbd>P</Kbd>}
          </button>
          <button
            onClick={() => setSearchMode(true)}
            className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground border-x border-dashed border-muted-foreground h-full"
          >
            <Search className="size-4" />
            <span className="text-sm font-medium">Search</span>
            {showShortcutHints && <Kbd>F</Kbd>}
          </button>
          <button
            onClick={onSettingsOpen}
            className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground h-full"
          >
            <Settings className="size-4" />
            <span className="text-sm font-medium">Settings</span>
            {showShortcutHints && <Kbd>S</Kbd>}
          </button>
        </>
      )}
    </nav>
  );
}
