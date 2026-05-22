import { useState, useRef, useEffect, useCallback } from 'react'
import { useSessions, useRevokeAllSessions } from '../../hooks/useAuthQueries'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function SessionsTab() {
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-red-600">Failed to load sessions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-xl font-semibold text-on-surface">
            Active Sessions
          </h2>

          {sessions && sessions.length > 1 && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={revokeMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
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
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-slate-400 text-base">devices</span>
                    <span className="text-sm font-medium text-on-surface truncate">
                      {session.user_agent?.split('/')[0] || 'Unknown Device'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>IP: {session.ip}</span>
                    <span>Created: {new Date(session.created_at).toLocaleString()}</span>
                    <span>Last Active: {new Date(session.last_active_at).toLocaleString()}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 ml-4">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Logout all other sessions">
          <div ref={confirmRef} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
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
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeAll}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
