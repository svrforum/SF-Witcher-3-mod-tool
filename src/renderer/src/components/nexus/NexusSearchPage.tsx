import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useIpc } from '../../hooks/use-ipc'
import { useToastStore } from '../layout/Toast'

interface PresetMod {
  name: string
  nexusUrl?: string
  loadOrder: number
  notes?: string
  needsMerge?: boolean
}

interface Preset {
  id: string
  name: string
  nameKo?: string
  description: string
  descriptionKo?: string
  mods: PresetMod[]
  isBuiltIn: boolean
}

export default function NexusSearchPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { invoke } = useIpc()
  const addToast = useToastStore((s) => s.addToast)
  const [presets, setPresets] = useState<Preset[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadPresets()
  }, [])

  async function loadPresets(): Promise<void> {
    try {
      const data = await invoke<Preset[]>('presets:list')
      const builtIn = data.filter((p) => p.isBuiltIn)
      setPresets(builtIn)
      if (builtIn.length > 0) setActiveCategory(builtIn[0].id)
    } catch (e) {
      addToast(String(e), 'error')
    }
  }

  function openNexusPage(url: string): void {
    window.open(url, '_blank')
  }

  const isKo = i18n.language === 'ko'
  const activePreset = presets.find((p) => p.id === activeCategory)

  const filteredMods = activePreset?.mods.filter((mod) =>
    filter === '' ||
    mod.name.toLowerCase().includes(filter.toLowerCase()) ||
    (mod.notes || '').toLowerCase().includes(filter.toLowerCase())
  ) || []

  // Collect all mods from all presets for "all" view
  const allMods = presets.flatMap((p) =>
    p.mods.map((m) => ({ ...m, category: isKo && p.nameKo ? p.nameKo : p.name }))
  )
  const filteredAllMods = allMods.filter((mod) =>
    filter === '' ||
    mod.name.toLowerCase().includes(filter.toLowerCase()) ||
    (mod.notes || '').toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-witcher-gold mb-4">{t('search.title')}</h1>

      {/* Search filter */}
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={isKo ? '모드 이름으로 검색...' : 'Filter mods by name...'}
          className="w-full px-4 py-2 bg-witcher-surface border border-witcher-border rounded-lg text-sm text-witcher-text placeholder-witcher-text-muted focus:border-witcher-gold focus:outline-none"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            activeCategory === 'all'
              ? 'bg-witcher-gold text-witcher-bg font-bold'
              : 'bg-witcher-surface text-witcher-text-muted hover:text-witcher-text border border-witcher-border'
          }`}
        >
          {isKo ? '전체' : 'All'}
        </button>
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setActiveCategory(preset.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeCategory === preset.id
                ? 'bg-witcher-gold text-witcher-bg font-bold'
                : 'bg-witcher-surface text-witcher-text-muted hover:text-witcher-text border border-witcher-border'
            }`}
          >
            {isKo && preset.nameKo ? preset.nameKo : preset.name}
          </button>
        ))}
      </div>

      {/* Mod list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {activeCategory === 'all' ? (
          filteredAllMods.map((mod, idx) => (
            <ModRow
              key={`${mod.name}-${idx}`}
              mod={mod}
              category={mod.category}
              onOpen={openNexusPage}
              isKo={isKo}
            />
          ))
        ) : (
          filteredMods.map((mod, idx) => (
            <ModRow
              key={`${mod.name}-${idx}`}
              mod={mod}
              onOpen={openNexusPage}
              isKo={isKo}
            />
          ))
        )}
        {((activeCategory === 'all' && filteredAllMods.length === 0) ||
          (activeCategory !== 'all' && filteredMods.length === 0)) && (
          <div className="text-center py-12 text-witcher-text-muted">
            {isKo ? '검색 결과가 없습니다' : 'No mods found'}
          </div>
        )}
      </div>
    </div>
  )
}

function ModRow({
  mod,
  category,
  onOpen,
  isKo,
}: {
  mod: { name: string; nexusUrl?: string; notes?: string; needsMerge?: boolean }
  category?: string
  onOpen: (url: string) => void
  isKo: boolean
}): JSX.Element {
  return (
    <div className="bg-witcher-card border border-witcher-border rounded-lg p-4 flex items-center gap-4 hover:border-witcher-gold/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-witcher-text truncate">{mod.name}</span>
          {mod.needsMerge && (
            <span className="text-xs px-1.5 py-0.5 bg-witcher-red/20 text-witcher-red-light rounded shrink-0">
              {isKo ? '병합 필요' : 'Merge'}
            </span>
          )}
        </div>
        {mod.notes && (
          <p className="text-xs text-witcher-text-muted mt-1 truncate">{mod.notes}</p>
        )}
        {category && (
          <span className="text-xs text-witcher-gold/60 mt-0.5 block">{category}</span>
        )}
      </div>
      {mod.nexusUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpen(mod.nexusUrl!)
          }}
          className="px-3 py-1.5 text-xs bg-witcher-gold/20 text-witcher-gold rounded hover:bg-witcher-gold/30 transition-colors shrink-0"
        >
          {isKo ? 'Nexus에서 다운로드' : 'Download on Nexus'}
        </button>
      )}
    </div>
  )
}
