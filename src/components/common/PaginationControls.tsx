interface PaginationControlsProps {
  currentPage: number
  total: number
  pageSize: number
  onChange: (page: number) => void
  className?: string
}

export function PaginationControls({
  currentPage,
  total,
  pageSize,
  onChange,
  className = ''
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize)

  if (total === 0) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded border border-outline-variant bg-surface-container-low text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-on-surface-variant">
        Page {currentPage} of {totalPages} ({total} total)
      </span>
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded border border-outline-variant bg-surface-container-low text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
      >
        Next
      </button>
    </div>
  )
}
