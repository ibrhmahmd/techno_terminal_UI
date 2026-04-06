import type { Session } from '../../api/academics'
import { formatDate } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'

interface SessionsListProps {
  sessions: Session[]
  deletingSessionId: number | null
  isProcessing: boolean
  onEdit: (session: Session) => void
  onCancel: (sessionId: number) => void
  onDeleteRequest: (sessionId: number) => void
  onDeleteConfirm: (sessionId: number) => void
  onDeleteCancel: () => void
}

export function SessionsList({
  sessions,
  deletingSessionId,
  isProcessing,
  onEdit,
  onCancel,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel
}: SessionsListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-on-surface">Sessions ({sessions.length})</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {sessions.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">No sessions scheduled yet</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-medium text-on-surface">
                    {formatDate(session.session_date, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm text-slate-500">
                    {session.start_time} - {session.end_time}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sessionStatusColors[session.status] || 'bg-blue-100 text-blue-700'}`}>
                  {session.status}
                </span>
                {session.is_extra_session && (
                  <span className="text-xs text-orange-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">event_available</span>
                    Extra session
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {deletingSessionId === session.id ? (
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    <span className="text-xs font-bold text-red-600">Delete?</span>
                    <button 
                      onClick={() => onDeleteConfirm(session.id)} 
                      className="text-xs font-bold text-red-700 hover:underline"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={onDeleteCancel} 
                      className="text-xs font-bold text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(session)}
                      className="p-2 text-slate-400 hover:text-secondary transition-colors"
                      title="Edit session"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => onCancel(session.id)}
                        disabled={isProcessing}
                        className="p-2 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                        title="Cancel session"
                      >
                        <span className="material-symbols-outlined text-sm">block</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteRequest(session.id)}
                      disabled={isProcessing}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete session"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
