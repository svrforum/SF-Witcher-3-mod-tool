import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps): JSX.Element {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search.placeholder')}
        className="flex-1 bg-witcher-surface border border-witcher-border rounded px-4 py-2.5
                   text-sm text-witcher-text placeholder:text-witcher-text-muted/50
                   focus:border-witcher-gold focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-6 py-2.5 bg-witcher-gold text-witcher-bg text-sm font-semibold rounded
                   hover:bg-witcher-gold-light transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('common.loading') : t('search.title')}
      </button>
    </form>
  )
}
