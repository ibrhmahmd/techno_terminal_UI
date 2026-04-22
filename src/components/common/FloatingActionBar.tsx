interface FloatingActionBarProps {
  primaryAction: {
    label: string
    icon: string
    onClick: () => void
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    icon: string
    onClick: () => void
    disabled?: boolean
  }
  className?: string
}

export function FloatingActionBar({
  primaryAction,
  secondaryAction,
  className = '',
}: FloatingActionBarProps) {
  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 z-50 ${className}`}>
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
          className="px-4 py-3 bg-white text-slate-600 font-medium rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">{secondaryAction.icon}</span>
          {secondaryAction.label}
        </button>
      )}
      <button
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        className="px-6 py-3 bg-secondary text-white font-medium rounded-full shadow-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined">{primaryAction.icon}</span>
        {primaryAction.label}
      </button>
    </div>
  )
}
