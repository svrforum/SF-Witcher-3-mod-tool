import { useTranslation } from 'react-i18next'

interface ModInstallDialogProps {
  visible: boolean
}

export default function ModInstallDialog({ visible }: ModInstallDialogProps): JSX.Element | null {
  const { t } = useTranslation()

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-witcher-surface border border-witcher-border rounded-lg px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
        <div className="w-8 h-8 border-2 border-witcher-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-witcher-text">{t('common.loading')}</p>
      </div>
    </div>
  )
}
