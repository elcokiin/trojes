"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Pin, Search, Settings, X } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { useShortcutPreference } from "@/hooks/use-shortcut-preferences";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  handleClearSearch: () => void;
}

interface BottomNavProps {
  onPinnedToggle: () => void;
  onSettingsOpen: () => void;
  onSearchModeChange?: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleClearSearch: () => void;
}

export function BottomNav({ onPinnedToggle, onSettingsOpen, onSearchModeChange, searchQuery, setSearchQuery, handleClearSearch }: BottomNavProps) {
  const isMobile = useIsMobile();
  const [showShortcutHints] = useShortcutPreference("troje-shortcut-hints");
  const [searchMode, setSearchMode] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const onSearchModeChangeRef = useRef(onSearchModeChange);
  onSearchModeChangeRef.current = onSearchModeChange;
  const searchModeRef = useRef(searchMode);
  searchModeRef.current = searchMode;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        const next = !searchModeRef.current
        setSearchMode(next)
        onSearchModeChangeRef.current?.(next)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (searchMode && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchMode])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
    }, 150)
  }, [setSearchQuery])

  const handleCloseSearch = useCallback(() => {
    setSearchMode(false)
    onSearchModeChange?.(false)
    setInputValue("")
    clearTimeout(debounceRef.current)
    handleClearSearch()
  }, [handleClearSearch, onSearchModeChange])

  const handleXClick = useCallback(() => {
    clearTimeout(debounceRef.current)
    if (inputValue) {
      setInputValue("")
      setSearchQuery("")
    } else {
      handleCloseSearch()
    }
  }, [inputValue, setSearchQuery, handleCloseSearch])

  const handleOpenSearch = useCallback(() => {
    setSearchMode(true)
    onSearchModeChange?.(true)
  }, [onSearchModeChange])

  return (
    <nav className="shrink-0 h-12 border-t bg-background flex items-stretch">
      {searchMode ? (
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
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
            aria-label={inputValue ? "Clear search" : "Close search"}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : isMobile ? (
        <>
          <button
            onClick={onPinnedToggle}
            className="flex items-center justify-center text-muted-foreground px-4"
          >
            <Pin className="size-4" />
          </button>
          <button
            onClick={handleOpenSearch}
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
          <button
            onClick={onPinnedToggle}
            className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground h-full"
          >
            <Pin className="size-4" />
            <span className="text-sm font-medium">Pin</span>
            {showShortcutHints && <Kbd>P</Kbd>}
          </button>
          <button
            onClick={handleOpenSearch}
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
