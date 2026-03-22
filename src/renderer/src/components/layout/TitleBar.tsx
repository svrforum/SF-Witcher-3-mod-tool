export default function TitleBar(): JSX.Element {
  return (
    <div
      className="flex items-center justify-between bg-witcher-surface border-b border-witcher-border h-9 px-3 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <span className="text-witcher-gold font-bold text-sm tracking-wide">W3 Mod Manager</span>
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          className="w-10 h-9 flex items-center justify-center text-witcher-text-muted hover:bg-witcher-card hover:text-witcher-text transition-colors text-xs"
          onClick={() => window.api.windowMinimize()}
          aria-label="Minimize"
        >
          &#x2500;
        </button>
        <button
          className="w-10 h-9 flex items-center justify-center text-witcher-text-muted hover:bg-witcher-card hover:text-witcher-text transition-colors text-xs"
          onClick={() => window.api.windowMaximize()}
          aria-label="Maximize"
        >
          &#x25A1;
        </button>
        <button
          className="w-10 h-9 flex items-center justify-center text-witcher-text-muted hover:bg-red-600 hover:text-white transition-colors text-xs"
          onClick={() => window.api.windowClose()}
          aria-label="Close"
        >
          &#x2715;
        </button>
      </div>
    </div>
  )
}
