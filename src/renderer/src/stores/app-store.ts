import { create } from 'zustand'

export interface AppConfig {
  gamePath: string
  gameVersion: 'nextgen' | 'classic'
  platform: 'steam' | 'gog' | 'epic' | 'manual'
  nexusApiKey?: string
  language: 'ko' | 'en'
}

interface AppState {
  config: AppConfig | null
  currentPage: string
  isLoading: boolean
  setConfig: (config: AppConfig) => void
  setPage: (page: string) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  config: null,
  currentPage: 'mods',
  isLoading: true,
  setConfig: (config) => set({ config }),
  setPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
