import { useState } from 'react'
import { useMyActivity } from '../../hooks/useAuthQueries'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EVENT_LABELS } from '../../constants/auditLabels'

export function ActivityTab() {
  const [page, setPage] = useState(0)
  const limit = 50
  const { data, isLoading, error } = useMyActivity({ skip: page * limit, limit })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-red-600">Failed to load activity log.</p>
      </div>
    )
  }

  const entries = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
        Account Activity
      </h2>

      {entries.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No activity recorded yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Event</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">IP Address</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <span className="text-on-surface">{EVENT_LABELS[entry.event_type] || entry.event_type}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-500">{entry.ip_address || '—'}</td>
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
              <p className="text-xs text-slate-500">
                Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
