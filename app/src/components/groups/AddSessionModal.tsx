import { useState, type FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { addExtraSession, type Session } from '../../api/academics'

interface AddSessionModalProps {
  groupId: number
  levelNumber: number
  isOpen: boolean
  onClose: () => void
  onAdded: (session: Session) => void
}

export function AddSessionModal({ groupId, levelNumber, isOpen, onClose, onAdded }: AddSessionModalProps) {
  const [extraDate, setExtraDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!extraDate) {
        throw new Error('Please select a date')
      }

      const newSession = await addExtraSession({ 
        group_id: groupId, 
        level_number: levelNumber, 
        extra_date: extraDate, 
        notes 
      })
      onAdded(newSession)
      onClose()
      // Reset form
      setExtraDate('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Extra Session"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            Add Session
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="extra_date" className="text-sm font-medium text-on-surface">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="extra_date"
            type="date"
            value={extraDate}
            onChange={(e) => setExtraDate(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-on-surface">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes || ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter session notes..."
            rows={3}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}
