import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
        >
          First
        </button>
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) pageNum = i + 1
          else if (currentPage <= 3) pageNum = i + 1
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
          else pageNum = currentPage - 2 + i
          return (
            <button 
              key={pageNum} 
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 text-sm font-medium rounded transition-colors ${
                currentPage === pageNum ? 'bg-secondary text-white' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
        >
          Last
        </button>
      </div>
    </div>
  )
}
