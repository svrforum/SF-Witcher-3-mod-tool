import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore, AppConfig } from '../../stores/app-store'
import { useIpc } from '../../hooks/use-ipc'

type Step = 'language' | 'detect' | 'manual'

export default function SetupWizard(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { invoke } = useIpc()
  const setConfig = useAppStore((s) => s.setConfig)
  const [step, setStep] = useState<Step>('language')
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState('')

  const handleLanguageSelect = async (lang: 'ko' | 'en'): Promise<void> => {
    setLanguage(lang)
    await i18n.changeLanguage(lang)
  }

  const handleAutoDetect = async (): Promise<void> => {
    setDetecting(true)
    setError('')
    try {
      const result = await invoke<AppConfig>('game:detect')
      if (result?.gamePath) {
        const config: AppConfig = {
          gamePath: result.gamePath,
          gameVersion: result.gameVersion || 'nextgen',
          platform: result.platform || 'manual',
          language,
          nexusApiKey: ''
        }
        await invoke('config:save', config)
        setConfig(config)
      } else {
        setStep('manual')
      }
    } catch {
      setStep('manual')
    } finally {
      setDetecting(false)
    }
  }

  const handleManualSelect = async (): Promise<void> => {
    setError('')
    try {
      const result = await invoke<{ gamePath: string; gameVersion: string }>('game:select-manual')
      if (result?.gamePath) {
        const config: AppConfig = {
          gamePath: result.gamePath,
          gameVersion: (result.gameVersion as AppConfig['gameVersion']) || 'nextgen',
          platform: 'manual',
          language,
          nexusApiKey: ''
        }
        await invoke('config:save', config)
        setConfig(config)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-witcher-bg">
      <div className="bg-witcher-card border border-witcher-border rounded-xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-witcher-gold text-center mb-6">
          {t('app.title')}
        </h1>

        {step === 'language' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-witcher-text-muted text-sm text-center">
              {t('settings.language')}
            </p>
            <div className="flex gap-3">
              {(['ko', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    language === lang
                      ? 'bg-witcher-gold text-witcher-bg'
                      : 'bg-witcher-surface border border-witcher-border text-witcher-text-muted hover:border-witcher-gold'
                  }`}
                >
                  {lang === 'ko' ? '\uD55C\uAD6D\uC5B4' : 'English'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('detect')}
              className="mt-2 px-6 py-2 bg-witcher-gold text-witcher-bg font-semibold rounded-lg hover:bg-witcher-gold-light transition-colors"
            >
              {t('common.confirm')}
            </button>
          </div>
        )}

        {step === 'detect' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-witcher-text-muted text-sm text-center">
              {t('settings.autoDetected')}
            </p>
            <button
              onClick={handleAutoDetect}
              disabled={detecting}
              className="px-6 py-2.5 bg-witcher-gold text-witcher-bg font-semibold rounded-lg hover:bg-witcher-gold-light transition-colors disabled:opacity-50"
            >
              {detecting ? t('common.loading') : t('settings.autoDetected')}
            </button>
            <button
              onClick={() => setStep('manual')}
              className="text-sm text-witcher-text-muted hover:text-witcher-gold transition-colors underline"
            >
              {t('settings.changePath')}
            </button>
          </div>
        )}

        {step === 'manual' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-witcher-text-muted text-sm text-center">
              {t('settings.gamePath')}
            </p>
            <button
              onClick={handleManualSelect}
              className="px-6 py-2.5 bg-witcher-gold text-witcher-bg font-semibold rounded-lg hover:bg-witcher-gold-light transition-colors"
            >
              {t('settings.changePath')}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={() => setStep('detect')}
              className="text-sm text-witcher-text-muted hover:text-witcher-gold transition-colors underline"
            >
              {t('settings.autoDetected')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
