import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Session } from '../../api/academics'

interface EditSessionPopupProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
  onSave: (sessionId: string, updates: Partial<Session>) => void
}

export function EditSessionPopup({ isOpen, onClose, session, onSave }: EditSessionPopupProps) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when session changes
  useEffect(() => {
    if (session) {
      setDate(session.date)
      setStartTime(session.start_time)
      setEndTime(session.end_time)
      setInstructorName(session.instructor_name)
      setNotes(session.notes || '')
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setIsLoading(true)
    try {
      await onSave(session.id, {
        date,
        start_time: startTime,
        end_time: endTime,
        instructor_name: instructorName,
        notes
      })
      onClose()
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Session"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-secondary/90 flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : null}
            Save Changes
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Instructor</label>
          <input
            type="text"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            placeholder="Enter instructor name..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter session notes..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}
