import type { AuditLogEntry } from '../../api/auth/types'
import { EVENT_LABELS } from '../../constants/auditLabels'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface AuditLogTableProps {
  data: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  error: boolean
}

export function AuditLogTable({ data, total, page, pageSize, onPageChange, isLoading, error }: AuditLogTableProps) {
  const totalPages = Math.ceil(total / pageSize)

  if (isLoading) {
    return <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><LoadingSpinner /></div>
  }

  if (error) {
    return <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><p className="text-red-600">Failed to load audit data.</p></div>
  }

  if (data.length === 0) {
    return <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><p className="text-slate-500">No records found.</p></div>
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-2 text-slate-500 font-medium">Event</th>
              <th className="text-left py-3 px-2 text-slate-500 font-medium">User ID</th>
              <th className="text-left py-3 px-2 text-slate-500 font-medium">IP Address</th>
              <th className="text-left py-3 px-2 text-slate-500 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2">
                  <span className="text-on-surface">{EVENT_LABELS[entry.event_type] || entry.event_type}</span>
                </td>
                <td className="py-3 px-2 text-slate-500">{entry.user_id ?? '—'}</td>
                <td className="py-3 px-2 text-slate-500">{entry.ip_address || '—'}</td>
                <td className="py-3 px-2 text-slate-500">{new Date(entry.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <p className="text-xs text-slate-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface AuditDateFilterProps {
  from: string
  to: string
  onFromChange: (val: string) => void
  onToChange: (val: string) => void
}

export function AuditDateFilter({ from, to, onFromChange, onToChange }: AuditDateFilterProps) {
  return (
    <div className="flex gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
        <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
        <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20" />
      </div>
    </div>
  )
}


