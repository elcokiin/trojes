import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import {
  SHORTCUT_DEFAULTS,
  type ShortcutPreferenceKey,
} from "@/lib/shortcuts"

export interface ShortcutStore {
  prefs: Record<ShortcutPreferenceKey, boolean>
  setPreference: (key: ShortcutPreferenceKey, enabled: boolean) => void
}

export const useShortcutStore = create<ShortcutStore>()(
  persist(
    (set) => ({
      prefs: { ...SHORTCUT_DEFAULTS },
      setPreference: (key, enabled) =>
        set((state) =>
          state.prefs[key] === enabled
            ? state
            : { prefs: { ...state.prefs, [key]: enabled } },
        ),
    }),
    {
      name: "trojes-shortcut-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ prefs: state.prefs }),
    },
  ),
)
