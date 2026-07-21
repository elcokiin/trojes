import { create } from "zustand"

export interface UIStore {
  settingsOpen: boolean
  pinnedTrayOpen: boolean
  captureOpen: boolean
  focusIdeaId: string | null
  overlaysOpen: number
  dropdownOpen: number
  setSettingsOpen: (open: boolean) => void
  setPinnedTrayOpen: (open: boolean) => void
  togglePinnedTray: () => void
  setCaptureOpen: (open: boolean) => void
  setFocusIdeaId: (id: string | null) => void
  pushOverlay: () => void
  popOverlay: () => void
  pushDropdown: () => void
  popDropdown: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  pinnedTrayOpen: false,
  captureOpen: false,
  focusIdeaId: null,
  overlaysOpen: 0,
  dropdownOpen: 0,
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setPinnedTrayOpen: (pinnedTrayOpen) => set({ pinnedTrayOpen }),
  togglePinnedTray: () => set((state) => ({ pinnedTrayOpen: !state.pinnedTrayOpen })),
  setCaptureOpen: (captureOpen) => set({ captureOpen }),
  setFocusIdeaId: (focusIdeaId) => set({ focusIdeaId }),
  pushOverlay: () => set((state) => ({ overlaysOpen: state.overlaysOpen + 1 })),
  popOverlay: () => set((state) => ({ overlaysOpen: Math.max(0, state.overlaysOpen - 1) })),
  pushDropdown: () => set((state) => ({
    dropdownOpen: state.dropdownOpen + 1,
    overlaysOpen: state.overlaysOpen + 1,
  })),
  popDropdown: () => set((state) => ({
    dropdownOpen: Math.max(0, state.dropdownOpen - 1),
    overlaysOpen: Math.max(0, state.overlaysOpen - 1),
  })),
}))


