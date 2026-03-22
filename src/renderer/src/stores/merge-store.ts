import { create } from 'zustand'

export interface ScriptConflict {
  scriptPath: string
  involvedMods: string[]
  status: 'unresolved' | 'auto_merged' | 'manual_merged'
  mergedFilePath?: string
}

interface MergeState {
  conflicts: ScriptConflict[]
  isMerging: boolean
  setConflicts: (conflicts: ScriptConflict[]) => void
  setMerging: (merging: boolean) => void
}

export const useMergeStore = create<MergeState>((set) => ({
  conflicts: [],
  isMerging: false,
  setConflicts: (conflicts) => set({ conflicts }),
  setMerging: (merging) => set({ isMerging: merging }),
}))
