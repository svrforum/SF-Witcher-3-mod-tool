import { useEffect } from 'react'
import { useAppStore } from './stores/app-store'
import TitleBar from './components/layout/TitleBar'
import Sidebar from './components/layout/Sidebar'
import MainContent from './components/layout/MainContent'
import { ToastContainer } from './components/layout/Toast'
import SetupWizard from './components/setup/SetupWizard'

function App(): JSX.Element {
  const config = useAppStore((s) => s.config)
  const isLoading = useAppStore((s) => s.isLoading)
  const setConfig = useAppStore((s) => s.setConfig)
  const setLoading = useAppStore((s) => s.setLoading)

  useEffect(() => {
    const loadConfig = async (): Promise<void> => {
      try {
        const result = await window.api.invoke('config:load')
        if (result.success && result.data) {
          setConfig(result.data as ReturnType<typeof useAppStore.getState>['config'] & object)
        }
      } catch {
        // Config not found — first launch
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [setConfig, setLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-witcher-bg">
        <span className="text-witcher-gold text-lg">Loading...</span>
      </div>
    )
  }

  if (!config?.gamePath) {
    return (
      <>
        <SetupWizard />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
