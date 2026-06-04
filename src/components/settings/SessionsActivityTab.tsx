import { useState, useRef, useEffect, useCallback } from 'react'
import { useSessions, useRevokeAllSessions, useMyActivity } from '../../hooks/useAuthQueries'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EVENT_LABELS } from '../../constants/auditLabels'

function ActiveSessions() {
  const { data: sessions, isLoading, error } = useSessions()
  const revokeMutation = useRevokeAllSessions()
  const [showConfirm, setShowConfirm] = useState(false)
  const confirmRef = useRef<HTMLDivElement>(null)

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!confirmRef.current) return
    const focusable = confirmRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.key === 'Escape') {
      setShowConfirm(false)
      return
    }
    if (e.key !== 'Tab') return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!showConfirm) return
    const timer = setTimeout(() => {
      if (confirmRef.current) {
        const first = confirmRef.current.querySelector<HTMLElement>('button')
        first?.focus()
      }
    }, 0)
    document.addEventListener('keydown', trapFocus)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', trapFocus)
    }
  }, [showConfirm, trapFocus])

  const handleRevokeAll = async () => {
    try {
      await revokeMutation.mutateAsync()
      setShowConfirm(false)
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body">
        <p className="text-red-600">Failed to load sessions.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[6px] shadow-sm p-6 font-body">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400">devices</span>
          <h2 className="font-headline text-xl font-semibold text-on-surface">
            Active Sessions
          </h2>
        </div>

        {sessions && sessions.length > 1 && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={revokeMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-500/10 rounded-[6px] hover:bg-red-500/15 transition-colors flex items-center gap-2 duration-120"
          >
            {revokeMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="material-symbols-outlined text-base">logout</span>
            )}
            Logout All Other Sessions
          </button>
        )}
      </div>

      {!sessions || sessions.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No active sessions found.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[6px]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-slate-400 text-base">devices</span>
                  <span className="text-sm font-medium text-on-surface truncate">
                    {session.user_agent?.split('/')[0] || 'Unknown Device'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                  <span>IP: {session.ip}</span>
                  <span>Created: {new Date(session.created_at).toLocaleString()}</span>
                  <span>Last Active: {new Date(session.last_active_at).toLocaleString()}</span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-secondary/15 text-secondary ml-4 whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Active
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Logout all other sessions">
          <div ref={confirmRef} className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">
              Logout All Other Sessions?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              This will revoke all active sessions except your current one. You will need to
              re-authenticate on other devices.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-[6px] text-sm font-medium hover:bg-slate-200 transition-colors duration-120"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeAll}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[6px] text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity duration-120"
              >
                {revokeMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
                Logout All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityLog() {
  const [page, setPage] = useState(0)
  const limit = 50
  const { data, isLoading, error } = useMyActivity({ skip: page * limit, limit })

  if (isLoading) {
    return (
      <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body">
        <p className="text-red-600">Failed to load activity log.</p>
      </div>
    )
  }

  const entries = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="bg-white rounded-[6px] shadow-sm p-6 font-body">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-slate-400">history</span>
        <h2 className="font-headline text-xl font-semibold text-on-surface">
          Account Activity
        </h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No activity recorded yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Event</th>
                  <th className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">IP Address</th>
                  <th className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="odd:bg-white even:bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-3">
                      <span className="text-on-surface font-medium">{EVENT_LABELS[entry.event_type] || entry.event_type}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono">{entry.ip_address || '\u2014'}</td>
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4">
              <p className="text-xs text-slate-500">
                Showing {page * limit + 1}&#8211;{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

export function SessionsActivityTab() {
  return (
    <div className="space-y-6">
      <ActiveSessions />
      <ActivityLog />
    </div>
  )
}
