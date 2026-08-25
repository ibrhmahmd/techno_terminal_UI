
import { useTranslation } from 'react-i18next'

interface GroupsHeaderProps {
  totalGroups: number
  searchTerm: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
}

export function GroupsHeader({ 
  totalGroups, 
  searchTerm, 
  onSearchChange, 
  onCreateClick,
}: GroupsHeaderProps) {
  const { t } = useTranslation('groups')
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full flex items-end justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
            {t('groupsHeader.title', { count: totalGroups })}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            {t('groupsHeader.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-slate-500" aria-hidden="true">search</span>
            <input
              type="text"
              placeholder={t('groupsHeader.search_placeholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={t('groupsHeader.search_aria')}
              className="bg-transparent border-none outline-none text-sm text-on-surface min-w-[200px] placeholder-slate-400"
            />
          </div>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            {t('groupsHeader.create_button')}
          </button>
        </div>
      </div>
    </header>
  )
}
