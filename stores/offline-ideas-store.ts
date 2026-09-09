import { create } from "zustand"
import type { Idea } from "@/types/idea"

export interface OfflineIdeasStore {
  localIdeas: Idea[]
  isOnline: boolean
  addLocalIdea: (idea: Idea) => void
  removeLocalIdea: (id: string) => void
  setLocalIdeas: (ideas: Idea[]) => void
  setIsOnline: (online: boolean) => void
}

export const useOfflineIdeasStore = create<OfflineIdeasStore>((set) => ({
  localIdeas: [],
  isOnline: true,
  addLocalIdea: (idea) =>
    set((state) => ({ localIdeas: [idea, ...state.localIdeas] })),
  removeLocalIdea: (id) =>
    set((state) => ({
      localIdeas: state.localIdeas.filter((i) => i.id !== id),
    })),
  setLocalIdeas: (ideas) => set({ localIdeas: ideas }),
  setIsOnline: (isOnline) => set({ isOnline }),
}))
