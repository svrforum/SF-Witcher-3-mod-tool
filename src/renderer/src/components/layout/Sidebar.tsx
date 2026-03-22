import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../stores/app-store'

const navItems = [
  { key: 'mods', icon: '\u2692' },
  { key: 'merger', icon: '\u2699' },
  { key: 'search', icon: '\u2315' },
  { key: 'presets', icon: '\u2630' },
  { key: 'settings', icon: '\u2699' }
] as const

// Use distinct icons: mods=hammer&pick, merger=gear, search=search, presets=trigram, settings=wrench
const icons: Record<string, string> = {
  mods: '\u2692',
  merger: '\u29C9',
  search: '\u2315',
  presets: '\u2630',
  settings: '\u2731'
}

export default function Sidebar(): JSX.Element {
  const { t } = useTranslation()
  const currentPage = useAppStore((s) => s.currentPage)
  const setPage = useAppStore((s) => s.setPage)

  return (
    <aside className="w-52 bg-witcher-surface border-r border-witcher-border flex flex-col pt-2">
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = currentPage === item.key
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                ${active ? 'text-witcher-gold bg-witcher-card border-l-2 border-witcher-gold' : 'text-witcher-text-muted hover:text-witcher-text hover:bg-witcher-card/50 border-l-2 border-transparent'}`}
            >
              <span className="text-base w-5 text-center">{icons[item.key]}</span>
              <span>{t(`sidebar.${item.key}`)}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
