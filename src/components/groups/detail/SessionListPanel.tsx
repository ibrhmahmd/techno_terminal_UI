import { useState } from 'react'
import {
  DataTable,
  type DataTableColumn,
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
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status] || 'bg-slate-100 text-slate-800'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
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

  const columns: DataTableColumn<LevelSessionDTO>[] = [
    {
      key: 'session_number' as const,
      header: 'Session',
      cell: (row) => (
        <span className="font-medium text-slate-900">
          {row.is_extra_session ? 'Extra' : `#${row.session_number}`}
        </span>
      )
    },
    {
      key: 'date' as const,
      header: 'Date',
      cell: (row) => formatDate(row.date)
    },
    {
      key: 'time_start' as const,
      header: 'Time',
      cell: (row) => `${formatTime(row.time_start)} - ${formatTime(row.time_end)}`
    },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (row) => <SessionStatusBadge status={row.status} />
    },
    {
      key: 'session_id' as const,
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'scheduled' && (
            <button
              type="button"
              onClick={() => cancelSession(row.session_id)}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              Cancel
            </button>
          )}
          {row.status === 'cancelled' && (
            <button
              type="button"
              onClick={() => reactivateSession(row.session_id)}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Reactivate
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeleteId(row.session_id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="bg-slate-50 rounded-xl p-4 md:p-6 mt-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-headline font-semibold text-slate-800">Sessions</h4>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Session
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {sessions && sessions.length > 0 ? (
          <DataTable
            data={sessions}
            columns={columns as any}
            keyExtractor={(row) => row.session_id.toString()}
          />
        ) : (
          <EmptyState
            icon="calendar_month"
            title="No sessions found"
            message="There are no sessions for this level yet."
          />
        )}
      </div>

      <AddSessionDialog
        isOpen={isAddOpen}
        groupId={groupId}
        levelNumber={levelNumber}
        onClose={() => setIsAddOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
