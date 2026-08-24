import { useTranslation } from 'react-i18next'

interface ViewToggleProps {
  value: 'table' | 'cards'
  onChange: (mode: 'table' | 'cards') => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { t } = useTranslation('groups')
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5" role="group" aria-label="View mode">
      <button
        onClick={() => onChange('table')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:outline-none ${
          value === 'table'
            ? 'bg-white text-secondary shadow-sm'
            : 'text-slate-500 hover:text-secondary hover:bg-white/50'
        }`}
        title={t('viewToggle.table_title')}
        aria-pressed={value === 'table'}
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">table_rows</span>
      </button>
      <button
        onClick={() => onChange('cards')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:outline-none ${
          value === 'cards'
            ? 'bg-white text-secondary shadow-sm'
            : 'text-slate-500 hover:text-secondary hover:bg-white/50'
        }`}
        title={t('viewToggle.cards_title')}
        aria-pressed={value === 'cards'}
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">grid_view</span>
      </button>
    </div>
  )
}
