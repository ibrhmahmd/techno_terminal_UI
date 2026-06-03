interface FilterPillProps {
  icon: string
  label: string
  isExpanded?: boolean
  hasFilters?: boolean
  filterCount?: number
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function FilterPill({
  icon,
  label,
  isExpanded = false,
  hasFilters = false,
  filterCount = 0,
  onClick,
  disabled = false,
  className = '',
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isExpanded}
      className={`${className} font-headline text-sm font-medium transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none ${
        isExpanded
          ? 'bg-secondary text-white shadow-sm'
          : hasFilters
            ? 'bg-secondary/10 text-secondary border border-secondary/20'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{icon}</span>
      <span>{label}</span>
      {hasFilters && filterCount > 0 && (
        <span className="ml-1 w-5 h-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center tabular-nums">
          {filterCount}
        </span>
      )}
    </button>
  )
}
