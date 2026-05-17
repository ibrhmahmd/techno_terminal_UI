interface ViewToggleProps {
  value: 'table' | 'cards'
  onChange: (mode: 'table' | 'cards') => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5" role="group" aria-label="View mode">
      <button
        onClick={() => onChange('table')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
          value === 'table'
            ? 'bg-white text-secondary shadow-sm'
            : 'text-slate-500 hover:text-secondary hover:bg-white/50'
        }`}
        title="Table view"
        aria-pressed={value === 'table'}
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">table_rows</span>
      </button>
      <button
        onClick={() => onChange('cards')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
          value === 'cards'
            ? 'bg-white text-secondary shadow-sm'
            : 'text-slate-500 hover:text-secondary hover:bg-white/50'
        }`}
        title="Cards view"
        aria-pressed={value === 'cards'}
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">grid_view</span>
      </button>
    </div>
  )
}
