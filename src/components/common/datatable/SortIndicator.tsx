interface SortIndicatorProps {
  fieldKey: string
  currentSortField?: string
  currentSortDirection?: 'asc' | 'desc'
}

export function SortIndicator({
  fieldKey,
  currentSortField,
  currentSortDirection,
}: SortIndicatorProps) {
  if (currentSortField !== fieldKey) {
    return <span className="material-symbols-outlined text-slate-300 text-sm">swap_vert</span>
  }
  return (
    <span className="material-symbols-outlined text-secondary text-sm">
      {currentSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
    </span>
  )
}
