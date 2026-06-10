interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showTotalInfo?: boolean
  loading?: boolean
  totalRecords?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showTotalInfo = false,
  loading = false,
  totalRecords,
}: PaginationProps) {
  if (totalPages <= 0) return null

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= totalPages - 2) return totalPages - 4 + i
    return currentPage - 2 + i
  })

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap w-full">
      {/* Left: Page size selector */}
      {onPageSizeChange && pageSize && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
            aria-label="Page size"
            className="px-2 py-1 text-sm border border-slate-200 rounded bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:opacity-50"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">per page</span>
        </div>
      )}

      {/* Center: Page navigation buttons */}
      <div className="flex items-center gap-1 mx-auto flex-1 justify-center">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          aria-label="First Page"
          className="px-2 cursor-pointer py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="First Page"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">first_page</span>
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || loading}
          aria-label="Previous Page"
          className="px-2 cursor-pointer py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Previous Page"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span>
        </button>

        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            disabled={loading}
            aria-current={currentPage === pageNum ? 'page' : undefined}
            className={`w-8 cursor-pointer h-8 text-sm font-medium rounded transition-colors ${
              currentPage === pageNum
                ? 'bg-secondary text-white shadow-sm'
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || loading}
          aria-label="Next Page"
          className="px-2 cursor-pointer py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Next Page"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          aria-label="Last Page"
          className="px-2 cursor-pointer py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          title="Last Page"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">last_page</span>
        </button>
      </div>

      {/* Right: Optional info text */}
      {showTotalInfo && (
        <div className="flex items-center gap-2">
          {totalRecords !== undefined && (
            <span className="text-sm text-slate-500">
              Showing {Math.min((currentPage - 1) * (pageSize ?? 10) + 1, totalRecords)}–{Math.min(currentPage * (pageSize ?? 10), totalRecords)} of {totalRecords} records
            </span>
          )}
          <span className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  )
}
