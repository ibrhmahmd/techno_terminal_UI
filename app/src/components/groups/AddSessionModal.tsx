import { useState, FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { CreateSessionInput, Session } from '../../api/academics'

interface AddSessionModalProps {
  groupId: string
  isOpen: boolean
  onClose: () => void
  onAdded: (session: Session) => void
}

export function AddSessionModal({ groupId, isOpen, onClose, onAdded }: AddSessionModalProps) {
  const [formData, setFormData] = useState<CreateSessionInput>({
    date: '',
    start_time: '',
    end_time: '',
    instructor_name: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.date || !formData.start_time || !formData.end_time || !formData.instructor_name) {
        throw new Error('Please fill in all required fields')
      }

      // Import dynamically to avoid circular dependency issues
      const { addExtraSession } = await import('../../api/academics')
      const newSession = await addExtraSession(groupId, formData)
      onAdded(newSession)
      onClose()
      // Reset form
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        instructor_name: '',
        notes: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateSessionInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <label htmlFor="date" className="text-sm font-medium text-on-surface">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="start_time" className="text-sm font-medium text-on-surface">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="end_time" className="text-sm font-medium text-on-surface">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Instructor */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="instructor_name" className="text-sm font-medium text-on-surface">
            Instructor <span className="text-red-500">*</span>
          </label>
          <input
            id="instructor_name"
            type="text"
            value={formData.instructor_name}
            onChange={(e) => handleChange('instructor_name', e.target.value)}
            placeholder="Enter instructor name..."
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-on-surface">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
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
