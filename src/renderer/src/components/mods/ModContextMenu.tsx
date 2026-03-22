import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { InstalledMod } from '../../stores/mod-store'

interface ModContextMenuProps {
  mod: InstalledMod
  x: number
  y: number
  onClose: () => void
  onDelete: (id: string) => void
  onOpenFolder: (id: string) => void
  onOpenNexus: (url: string) => void
}

export default function ModContextMenu({
  mod,
  x,
  y,
  onClose,
  onDelete,
  onOpenFolder,
  onOpenNexus,
}: ModContextMenuProps): JSX.Element {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const items = [
    {
      label: t('mods.delete'),
      action: () => onDelete(mod.id),
      className: 'text-red-400 hover:text-red-300 hover:bg-red-900/30',
    },
    {
      label: t('mods.openFolder'),
      action: () => onOpenFolder(mod.id),
      className: 'text-witcher-text hover:text-witcher-gold hover:bg-witcher-card',
    },
    ...(mod.nexusUrl
      ? [
          {
            label: t('mods.openNexus'),
            action: () => onOpenNexus(mod.nexusUrl!),
            className: 'text-witcher-text hover:text-witcher-gold hover:bg-witcher-card',
          },
        ]
      : []),
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-witcher-surface border border-witcher-border rounded shadow-xl py-1 min-w-40"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.action()
            onClose()
          }}
          className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${item.className}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
