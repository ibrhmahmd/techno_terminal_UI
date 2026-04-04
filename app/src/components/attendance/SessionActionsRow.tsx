import { useState } from 'react'
import type { Session } from '../../api/academics'
import { sessionStatusColors } from '../../utils/colors'
import { ConfirmDialog } from '../common/ConfirmDialog'

interface SessionActionsRowProps {
  sessions: Session[]
  onEdit: (session: Session) => void
  onCancel: (sessionId: number) => void
  disabled?: boolean
}

export function SessionActionsRow({ sessions, onEdit, onCancel, disabled }: SessionActionsRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null)

  const isCancelled = (session: Session) => session.status === 'cancelled'

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

  return (
    <>
      <tr className="bg-surface-container-lowest border-t border-b border-outline-variant/10">
        {/* Empty student cell */}
        <td className="px-6 py-3 border-b border-outline-variant/10"></td>

        {sessions.map((session) => {
          const cancelled = isCancelled(session)

          return (
            <td
              key={`actions-${session.id}`}
              className={`px-4 py-3 border-l border-b border-outline-variant/10 text-center ${
                cancelled ? 'opacity-50 blur-[1px] bg-gray-100' : ''
              }`}
            >
              <div className="flex gap-2 justify-center">
                {cancelled ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sessionStatusColors.cancelled}`}>
                    CANCELLED
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(session)}
                      disabled={disabled || cancelled}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-secondary bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit session details"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>

                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelClick(session.id)}
                        disabled={disabled}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel this session"
                      >
                        <span className="material-symbols-outlined text-sm">block</span>
                        Cancel
                      </button>
                    )}
                  </>
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
    </>
  )
}
