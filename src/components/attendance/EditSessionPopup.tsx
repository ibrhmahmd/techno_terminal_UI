import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { type UpdateSessionDTO } from '../../api/academics'
import { getEmployeesPaginated } from '../../api/hr'
import type { Employee } from '../../api/hr'
import type { SessionWithAttendanceDTO } from '../../api/dashboard'

interface EditSessionPopupProps {
  isOpen: boolean
  onClose: () => void
  session: SessionWithAttendanceDTO | null
  onSave: (sessionId: number, updates: UpdateSessionDTO) => void
}

export function EditSessionPopup({ isOpen, onClose, session, onSave }: EditSessionPopupProps) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedInstructorId, setSelectedInstructorId] = useState<number>(0)
  const [originalInstructorId, setOriginalInstructorId] = useState<number>(0)
  const [isSubstitute, setIsSubstitute] = useState(false)
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [instructors, setInstructors] = useState<Employee[]>([])

  // Load instructors on mount
  useEffect(() => {
    async function loadInstructors() {
      try {
        const result = await getEmployeesPaginated({ limit: 100 })
        setInstructors(result.items)
      } catch {
        setInstructors([])
      }
    }
    loadInstructors()
  }, [])

  // Reset form when session changes
  useEffect(() => {
    if (session) {
      // Handle both old Session type and new SessionWithAttendanceDTO
      // New API uses: date, time_start, time_end, session_id
      // Old API uses: session_date, start_time, end_time, id
      setDate(session.session_date || (session as any).date || '')
      setStartTime(session.start_time || (session as any).time_start || '')
      setEndTime(session.end_time || (session as any).time_end || '')
      setSelectedInstructorId(session.actual_instructor_id || 0)
      setOriginalInstructorId(session.actual_instructor_id || 0)
      setIsSubstitute(session.is_substitute || false)
      setStatus(session.status)
      setNotes(session.notes || '')
    }
  }, [session])

  // Handle instructor change - auto-set is_substitute if different from original
  const handleInstructorChange = (instructorId: number) => {
    setSelectedInstructorId(instructorId)
    setIsSubstitute(instructorId !== originalInstructorId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setIsLoading(true)
    try {
      // Use session_id if available, otherwise fall back to id
      const sessionId = session.session_id || (session as SessionWithAttendanceDTO).id
      await onSave(sessionId, {
        session_date: date,
        start_time: startTime,
        end_time: endTime,
        actual_instructor_id: selectedInstructorId,
        is_substitute: isSubstitute,
        status: status,
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
          <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'scheduled' | 'completed' | 'cancelled')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isSubstitute"
            checked={isSubstitute}
            onChange={(e) => setIsSubstitute(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="isSubstitute" className="text-sm font-medium text-on-surface">
            Substitute Instructor
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Instructor</label>
          <select
            value={selectedInstructorId}
            onChange={(e) => handleInstructorChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value={0}>Select instructor...</option>
            {instructors.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name}
              </option>
            ))}
          </select>
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
