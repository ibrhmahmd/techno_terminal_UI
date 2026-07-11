import { useState } from 'react'
import type { SessionWithAttendanceDTO } from '../../api/dashboard'
import { sessionStatusColors } from '../../utils/colors'
import { ConfirmDialog } from '../common/ConfirmDialog'

interface SessionActionsRowProps {
  sessions: SessionWithAttendanceDTO[]
  onEdit: (session: SessionWithAttendanceDTO) => void
  onCancel: (sessionId: number) => void
  onDelete: (sessionId: number) => void
  onReactivate: (sessionId: number) => void
  onComplete: (sessionId: number) => void
  disabled?: boolean
}

export function SessionActionsRow({
  sessions,
  onEdit,
  onCancel,
  onDelete,
  onReactivate,
  onComplete,
  disabled
}: SessionActionsRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null)
  const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false)
  const [sessionToHardDelete, setSessionToHardDelete] = useState<number | null>(null)

  const isCancelled = (session: SessionWithAttendanceDTO) => session.status === 'cancelled'

  const handleCancelClick = (sessionId: number) => {
    setSessionToDelete(sessionId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (sessionToDelete !== null) {
      onCancel(sessionToDelete)
    }
    setIsDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  const handleCancelDialog = () => {
    setIsDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  const handleHardDeleteClick = (sessionId: number) => {
    setSessionToHardDelete(sessionId)
    setIsHardDeleteDialogOpen(true)
  }

  const handleConfirmHardDelete = () => {
    if (sessionToHardDelete !== null) {
      onDelete(sessionToHardDelete)
    }
    setIsHardDeleteDialogOpen(false)
    setSessionToHardDelete(null)
  }

  const handleCancelHardDeleteDialog = () => {
    setIsHardDeleteDialogOpen(false)
    setSessionToHardDelete(null)
  }

  return (
    <>
      <tr className="bg-slate-100 border-y border-slate-200">
        {/* Empty student cell */}
        <td className="px-6 py-3 border-y border-slate-200 border-r border-slate-200"></td>

        {sessions.map((session) => {
          const cancelled = isCancelled(session)

          return (
            <td
              key={`actions-${session.session_id}`}
              className={`px-4 py-4 border-l border-slate-200 text-center ${
                cancelled ? 'opacity-50 blur-[1px] motion-reduce:blur-none bg-gray-100' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1.5 justify-center flex-wrap">
                  {cancelled ? (
                    <>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${sessionStatusColors.cancelled}`}>
                        CANCELLED
                      </span>
                      <button
                        onClick={() => onReactivate(session.session_id)}
                        disabled={disabled}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-extrabold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors disabled:opacity-50"
                        aria-label="Reactivate session"
                      >
                        <span className="material-symbols-outlined text-base" aria-hidden="true">restore</span>
                        Reactivate
                      </button>
                      <button
                        onClick={() => handleHardDeleteClick(session.session_id)}
                        disabled={disabled}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-extrabold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                        aria-label="Delete session"
                      >
                        <span className="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(session)}
                        disabled={disabled || cancelled}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-extrabold text-secondary bg-secondary/10 rounded-md hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit session details"
                      >
                        <span className="material-symbols-outlined text-base" aria-hidden="true">edit</span>
                        Edit
                      </button>

                      {session.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelClick(session.session_id)}
                          disabled={disabled}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-extrabold text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Cancel session"
                        >
                          <span className="material-symbols-outlined text-base" aria-hidden="true">block</span>
                          Cancel
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleHardDeleteClick(session.session_id)}
                        disabled={disabled}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-extrabold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete session"
                      >
                        <span className="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Mark Complete / Completed Badge under the first row */}
                {!cancelled && (
                  <div className="w-full px-1">
                    {session.status === 'scheduled' ? (
                      <button
                        onClick={() => onComplete(session.session_id)}
                        disabled={disabled}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-sm font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Mark session as completed"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>
                        Mark Complete
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-1.5 py-1.5 text-sm font-extrabold text-emerald-800 bg-emerald-100/60 border border-emerald-200 rounded-md">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>
                        Completed
                      </div>
                    )}
                  </div>
                )}
              </div>
            </td>
          )
        })}
      </tr>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Cancel Session"
        message="Are you sure you want to cancel this session? This action cannot be undone."
        confirmText="Cancel Session"
        cancelText="Keep Session"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDialog}
        variant="warning"
      />

      <ConfirmDialog
        isOpen={isHardDeleteDialogOpen}
        title="Delete Session"
        message="Are you sure you want to delete this session entirely? This action is permanent and cannot be undone."
        confirmText="Delete Session"
        cancelText="Keep Session"
        onConfirm={handleConfirmHardDelete}
        onCancel={handleCancelHardDeleteDialog}
        variant="danger"
      />
    </>
  )
}
