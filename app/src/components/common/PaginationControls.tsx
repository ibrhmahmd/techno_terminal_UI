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
  
  if (totalPages <= 1) return null
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1 rounded border border-outline-variant bg-surface-container-low text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-on-surface-variant">
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-1 rounded border border-outline-variant bg-surface-container-low text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
      >
        Next
      </button>
    </div>
  )
}
