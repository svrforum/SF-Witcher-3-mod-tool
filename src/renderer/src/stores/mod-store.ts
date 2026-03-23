import { create } from 'zustand'

export interface InstalledMod {
  id: string
  name: string
  version: string
  nexusModId?: number
  nexusUrl?: string
  enabled: boolean
  loadOrder: number
  installedAt: string
  modifiedScripts: string[]
  extraFiles?: string[]
}

interface ModState {
  mods: InstalledMod[]
  isOperating: boolean
  setMods: (mods: InstalledMod[]) => void
  setOperating: (operating: boolean) => void
}

export const useModStore = create<ModState>((set) => ({
  mods: [],
  isOperating: false,
  setMods: (mods) => set({ mods }),
  setOperating: (operating) => set({ isOperating: operating }),
}))
