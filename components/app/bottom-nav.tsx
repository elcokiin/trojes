"use client";

import { useEffect, useCallback, useRef } from "react";
import { Pin, Search, Settings, X } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchStore } from "@/stores/search-store";
import { useUIStore } from "@/stores/ui-store";
import { useQueryState } from "nuqs";

export function BottomNav() {
  const isMobile = useIsMobile();
  const [showShortcutHints] = useShortcutPreference("trojes-shortcut-hints");
  const searchQuery = useSearchStore((s) => s.searchQuery);
  const debouncedSearch = useSearchStore((s) => s.debouncedSearch);
  const setSearchQuery = useSearchStore((s) => s.setSearchQuery);
  const seedSearch = useSearchStore((s) => s.seedSearch);
  const handleClearSearch = useSearchStore((s) => s.handleClearSearch);
  const searchMode = useSearchStore((s) => s.searchMode);
  const setSearchMode = useSearchStore((s) => s.setSearchMode);
  const togglePinnedTray = useUIStore((s) => s.togglePinnedTray);
  const setPinnedTrayOpen = useUIStore((s) => s.setPinnedTrayOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchModeRef = useRef(searchMode);
  searchModeRef.current = searchMode;

  const [urlQuery, setUrlQuery] = useQueryState("q", { defaultValue: "" });
  const urlSeedDone = useRef(false);
  const firstUrlSync = useRef(true);

  useEffect(() => {
    if (urlQuery && !urlSeedDone.current) {
      urlSeedDone.current = true;
      setSearchMode(true);
      setPinnedTrayOpen(false);
      seedSearch(urlQuery);
    }
  }, [urlQuery, setSearchMode, setPinnedTrayOpen, seedSearch]);

  useEffect(() => {
    if (firstUrlSync.current) {
      firstUrlSync.current = false;
      return;
    }
    setUrlQuery(debouncedSearch || null);
  }, [debouncedSearch, setUrlQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) return
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        const next = !searchModeRef.current
        setSearchMode(next)
        if (next) {
          setPinnedTrayOpen(false)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [setSearchMode, setPinnedTrayOpen])

  useEffect(() => {
    if (searchMode && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchMode])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [setSearchQuery])

  const handleCloseSearch = useCallback(() => {
    setSearchMode(false)
    handleClearSearch()
  }, [handleClearSearch, setSearchMode])

  const handleXClick = useCallback(() => {
    if (searchQuery) {
      handleClearSearch()
    } else {
      handleCloseSearch()
    }
  }, [searchQuery, handleClearSearch, handleCloseSearch])

  const handleOpenSearch = useCallback(() => {
    setSearchMode(true)
    setPinnedTrayOpen(false)
  }, [setSearchMode, setPinnedTrayOpen])

  return (
    <nav data-slot="bottom-nav" className="shrink-0 h-12 border-t bg-background flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {searchMode ? (
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            inputMode="search"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Find your ideas..."
            aria-label="Search ideas"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCloseSearch();
            }}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={handleXClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={searchQuery ? "Clear search" : "Close search"}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : isMobile ? (
        <>
          <button
            type="button"
            onClick={togglePinnedTray}
            className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-4"
          >
            <Pin className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenSearch}
            className="flex-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-x border-dashed border-muted-foreground h-full"
          >
            <span className="text-xs font-bold tracking-widest">SEARCH</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-4"
          >
            <Settings className="size-4" />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={togglePinnedTray}
            className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer h-full"
          >
            <Pin className="size-4" />
            <span className="text-sm font-medium">Pin</span>
            {showShortcutHints && <Kbd>P</Kbd>}
          </button>
          <button
            type="button"
            onClick={handleOpenSearch}
            className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-x border-dashed border-muted-foreground h-full"
          >
            <Search className="size-4" />
            <span className="text-sm font-medium">Search</span>
            {showShortcutHints && <Kbd>F</Kbd>}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer h-full"
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
