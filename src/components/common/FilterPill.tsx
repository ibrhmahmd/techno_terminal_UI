interface FilterPillProps {
  icon: string
  label: string
  isExpanded?: boolean
  hasFilters?: boolean
  filterCount?: number
  onClick: () => void
  disabled?: boolean
}

export function FilterPill({
  icon,
  label,
  isExpanded = false,
  hasFilters = false,
  filterCount = 0,
  onClick,
  disabled = false,
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-headline text-sm font-medium transition-all flex items-center gap-2 ${
        isExpanded
          ? 'bg-secondary text-white shadow-sm'
          : hasFilters
            ? 'bg-secondary/10 text-secondary border border-secondary/20'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span>{label}</span>
      {hasFilters && filterCount > 0 && (
        <span className="ml-1 w-5 h-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center">
          {filterCount}
        </span>
      )}
    </button>
  )
}
