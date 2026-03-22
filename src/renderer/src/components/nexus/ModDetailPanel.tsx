import { useTranslation } from 'react-i18next'

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

interface ModDetailPanelProps {
  mod: ModDetail | null
  isLoading: boolean
  onClose: () => void
  onOpenNexus: (modId: number) => void
}

export default function ModDetailPanel({
  mod,
  isLoading,
  onClose,
  onOpenNexus,
}: ModDetailPanelProps): JSX.Element | null {
  const { t } = useTranslation()

  if (!mod && !isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-witcher-card border border-witcher-border rounded-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-witcher-border">
          <h2 className="text-lg font-semibold text-witcher-text truncate">
            {isLoading ? t('common.loading') : mod?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-witcher-text-muted hover:text-witcher-text text-xl leading-none px-1"
          >
            x
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="p-6 text-center text-witcher-text-muted text-sm">
            {t('common.loading')}
          </div>
        ) : mod ? (
          <div className="p-4 overflow-auto flex-1">
            {mod.picture_url && (
              <img
                src={mod.picture_url}
                alt={mod.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}

            <div className="space-y-3">
              <div>
                <span className="text-xs text-witcher-text-muted">Author</span>
                <p className="text-sm text-witcher-text">{mod.author}</p>
              </div>

              <div>
                <span className="text-xs text-witcher-text-muted">Version</span>
                <p className="text-sm text-witcher-text">{mod.version}</p>
              </div>

              <div>
                <span className="text-xs text-witcher-text-muted">{t('search.endorsements')}</span>
                <p className="text-sm text-witcher-text">{mod.endorsement_count.toLocaleString()}</p>
              </div>

              <div>
                <span className="text-xs text-witcher-text-muted">Summary</span>
                <p className="text-sm text-witcher-text">{mod.summary}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {mod && (
          <div className="p-4 border-t border-witcher-border">
            <button
              onClick={() => onOpenNexus(mod.mod_id)}
              className="w-full px-4 py-2 bg-witcher-gold text-witcher-bg text-sm font-semibold
                         rounded hover:bg-witcher-gold-light transition-colors"
            >
              {t('search.downloadOnNexus')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
