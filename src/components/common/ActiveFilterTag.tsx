interface ActiveFilterTagProps {
  label: string
  value: string
  onRemove: () => void
}

export function ActiveFilterTag({ label, value, onRemove }: ActiveFilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary text-sm rounded-full border border-secondary/20 animate-in fade-in slide-in-from-left-2">
      <span className="font-medium">{label}:</span>
      <span className="truncate max-w-[150px]">{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 w-4 h-4 rounded-full hover:bg-secondary/20 flex items-center justify-center transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </span>
  )
}

interface ActiveFilterTagsListProps {
  filters: { id: string; label: string; value: string }[]
  onRemoveFilter: (id: string) => void
  onClearAll: () => void
  className?: string
}

export function ActiveFilterTagsList({
  filters,
  onRemoveFilter,
  onClearAll,
  className = '',
}: ActiveFilterTagsListProps) {
  if (filters.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((filter) => (
        <ActiveFilterTag
          key={filter.id}
          label={filter.label}
          value={filter.value}
          onRemove={() => onRemoveFilter(filter.id)}
        />
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-slate-500 hover:text-secondary underline ml-2"
      >
        Clear all
      </button>
    </div>
  )
}
