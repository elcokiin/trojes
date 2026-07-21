import { create } from "zustand"

interface SearchStore {
  searchMode: boolean
  searchQuery: string
  debouncedSearch: string
  setSearchMode: (mode: boolean) => void
  setSearchQuery: (query: string) => void
  seedSearch: (query: string) => void
  handleClearSearch: () => void
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined

export const useSearchStore = create<SearchStore>((set) => ({
  searchMode: false,
  searchQuery: "",
  debouncedSearch: "",
  setSearchMode: (searchMode) => set({ searchMode }),
  setSearchQuery: (searchQuery) => {
    set({ searchQuery })
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      set((state) => ({ debouncedSearch: state.searchQuery }))
    }, 300)
  },
  seedSearch: (query: string) => {
    clearTimeout(debounceTimer)
    set({ searchQuery: query, debouncedSearch: query })
  },
  handleClearSearch: () => {
    clearTimeout(debounceTimer)
    set({ searchQuery: "", debouncedSearch: "" })
  },
}))
