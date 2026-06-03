import { useState } from 'react'
import {
  ConfirmDialog,
  EmptyState
} from '../../common'
import { AddSessionDialog } from './AddSessionDialog'
import { useSessionMutations } from '../../../hooks/useSessionMutations'
import { formatDate, formatTime } from '../../../utils/formatting'
import type { LevelSessionDTO } from '../../../api/academics'

interface SessionListPanelProps {
  sessions: LevelSessionDTO[]
  groupId: number
  levelNumber: number
}

function SessionStatusBadge({ status }: { status: string }) {
  const styles = {
    scheduled: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  }[status] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  )
}

function SessionCard({
  session,
  onCancel,
  onReactivate,
  onDelete
}: {
  session: LevelSessionDTO
  onCancel: (id: number) => void
  onReactivate: (id: number) => void
  onDelete: (id: number) => void
}) {
  const statusColors = {
    scheduled: 'bg-blue-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-400',
  }[session.status] || 'bg-slate-400'

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col gap-3">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColors}`} />
      
      <div className="flex justify-between items-start pl-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-headline font-bold text-slate-900">
              {session.is_extra_session ? 'Extra Session' : `Session ${session.session_number}`}
            </span>
            <SessionStatusBadge status={session.status} />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {formatDate(session.date)}
          </div>
        </div>
        
        {/* Actions Dropdown / Icons */}
        <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          {session.status === 'scheduled' && (
            <button
              onClick={() => onCancel(session.session_id)}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              title="Cancel Session"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
          {session.status === 'cancelled' && (
            <button
              onClick={() => onReactivate(session.session_id)}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              title="Reactivate Session"
            >
              <span className="material-symbols-outlined text-[18px]">restore</span>
            </button>
          )}
          <button
            onClick={() => onDelete(session.session_id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Session"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <div className="pl-2 flex items-center gap-2 text-sm text-slate-600 mt-auto bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
        <span className="font-medium">
          {formatTime(session.time_start)} - {formatTime(session.time_end)}
        </span>
      </div>
    </div>
  )
}

export function SessionListPanel({ sessions, groupId, levelNumber }: SessionListPanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  
  const {
    deleteSession,
    cancelSession,
    reactivateSession
  } = useSessionMutations(groupId)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteSession(deleteId)
      setDeleteId(null)
    } catch {
      // Error handled by mutation toast generally, or we could handle it here
    }
  }

  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 md:p-6 mt-6 border border-slate-200/60">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-headline font-semibold text-slate-900 text-lg">Logic Nodes (Sessions)</h4>
          <p className="text-sm text-slate-500">Manage the schedule progression for this level.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Node
        </button>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sessions.map(session => (
            <SessionCard
              key={session.session_id}
              session={session}
              onCancel={cancelSession}
              onReactivate={reactivateSession}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon="calendar_month"
            title="No sessions found"
            message="There are no sessions for this level yet."
          />
        </div>
      )}

      <AddSessionDialog
        isOpen={isAddOpen}
        groupId={groupId}
        levelNumber={levelNumber}
        onClose={() => setIsAddOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Session Node"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
