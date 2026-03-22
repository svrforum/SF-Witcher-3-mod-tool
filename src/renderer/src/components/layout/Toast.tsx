import { useEffect } from 'react'
import { create } from 'zustand'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: number) => void
}

let nextId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = ++nextId
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))

const typeStyles: Record<Toast['type'], string> = {
  success: 'bg-green-800/90 border-green-600',
  error: 'bg-red-900/90 border-red-600',
  info: 'bg-witcher-card border-witcher-border'
}

function ToastItem({ toast }: { toast: Toast }): JSX.Element {
  const removeToast = useToastStore((s) => s.removeToast)

  useEffect(() => {
    return () => {}
  }, [])

  return (
    <div
      className={`px-4 py-3 rounded border text-sm text-witcher-text shadow-lg min-w-64 max-w-80 animate-slide-in ${typeStyles[toast.type]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{toast.message}</span>
        <button
          onClick={() => removeToast(toast.id)}
          className="text-witcher-text-muted hover:text-witcher-text text-xs ml-2 shrink-0"
        >
          &#x2715;
        </button>
      </div>
    </div>
  )
}

export function ToastContainer(): JSX.Element {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
