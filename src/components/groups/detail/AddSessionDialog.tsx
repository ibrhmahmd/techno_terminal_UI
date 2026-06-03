import { useState } from 'react'
import { Modal, DateInput } from '../../common'
import { useSessionMutations } from '../../../hooks/useSessionMutations'

interface AddSessionDialogProps {
  isOpen: boolean
  groupId: number
  levelNumber: number
  onClose: () => void
}

export function AddSessionDialog({ isOpen, groupId, levelNumber, onClose }: AddSessionDialogProps) {
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const { addSession, isAddingSession } = useSessionMutations(groupId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!date) {
      setError('Date is required')
      return
    }

    try {
      await addSession({
        group_id: groupId,
        level_number: levelNumber,
        extra_date: date,
        notes: notes || null
      })
      
      // Reset and close on success
      setDate('')
      setNotes('')
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add session')
    }
  }

  const handleClose = () => {
    setError(null)
    setDate('')
    setNotes('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Extra Session"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Session Date <span className="text-red-500">*</span>
            </label>
            <DateInput
              value={date}
              onChange={(val) => setDate(val || '')}
              placeholder="Select date"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
              rows={3}
              placeholder="E.g., Make-up session for..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled={isAddingSession}>
            Cancel
          </button>
          <button type="submit" disabled={isAddingSession || !date} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {isAddingSession ? 'Adding...' : 'Add Session'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
