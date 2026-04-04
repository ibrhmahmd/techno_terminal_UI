import React from 'react'

interface GroupsControlsProps {
  pageSize: number
  onPageSizeChange: (size: number) => void
  totalGroups: number
  currentPage: number
  processedCount: number
}

export function GroupsControls({ pageSize, onPageSizeChange, totalGroups, currentPage, processedCount }: GroupsControlsProps) {
  const start = processedCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const end = Math.min(currentPage * pageSize, processedCount)

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-slate-200 rounded bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-slate-500">entries per page</span>
      </div>
      <div className="text-sm text-slate-500">
        Showing {start} to {end} of {processedCount} entries
        {processedCount !== totalGroups && ` (filtered from ${totalGroups} total)`}
      </div>
    </div>
  )
}
