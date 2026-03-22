import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../stores/app-store'
import { useIpc } from '../../hooks/use-ipc'
import { useToastStore } from '../layout/Toast'
import SearchBar from './SearchBar'
import ModSearchResults from './ModSearchResults'
import ModDetailPanel from './ModDetailPanel'

interface SearchResult {
  name: string
  mod_id: number
  summary?: string
  author?: string
  endorsements?: number
  downloads?: number
  image?: string
}

interface ModDetail {
  mod_id: number
  name: string
  summary: string
  description?: string
  picture_url?: string
  version: string
  author: string
  endorsement_count: number
}

export default function NexusSearchPage(): JSX.Element {
  const { t } = useTranslation()
  const { invoke } = useIpc()
  const config = useAppStore((s) => s.config)
  const addToast = useToastStore((s) => s.addToast)

  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedMod, setSelectedMod] = useState<ModDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const hasApiKey = !!config?.nexusApiKey

  async function handleSearch(query: string): Promise<void> {
    setIsSearching(true)
    setHasSearched(true)
    try {
      const data = await invoke<SearchResult[]>('nexus:search', query)
      setResults(data)
    } catch (e) {
      addToast(String(e), 'error')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  async function handleOpenMod(modId: number): Promise<void> {
    try {
      await invoke('nexus:open-page', modId)
    } catch (e) {
      addToast(String(e), 'error')
    }
  }

  async function handleViewDetail(modId: number): Promise<void> {
    setIsLoadingDetail(true)
    try {
      const detail = await invoke<ModDetail>('nexus:mod-info', modId)
      setSelectedMod(detail)
    } catch (e) {
      addToast(String(e), 'error')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  if (!hasApiKey) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-witcher-text mb-6">{t('search.title')}</h1>
        <div className="text-center py-16">
          <p className="text-witcher-text-muted text-lg">{t('search.noApiKey')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-witcher-text mb-4">{t('search.title')}</h1>

      <SearchBar onSearch={handleSearch} isLoading={isSearching} />

      <div className="mt-4 flex-1 overflow-auto">
        <ModSearchResults
          results={results}
          isLoading={isSearching}
          hasSearched={hasSearched}
          onOpenMod={handleOpenMod}
          onViewDetail={handleViewDetail}
        />
      </div>

      <ModDetailPanel
        mod={selectedMod}
        isLoading={isLoadingDetail}
        onClose={() => setSelectedMod(null)}
        onOpenNexus={handleOpenMod}
      />
    </div>
  )
}
