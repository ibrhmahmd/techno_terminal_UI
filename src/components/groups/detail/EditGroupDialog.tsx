import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { type EnrichedGroupPublic, type UpdateGroupDTO } from '../../../api/academics'
import { useAllEmployees } from '../../../hooks/useAllEmployees'
import { formatTimeInput } from '../../../utils/formatting'
import { formToSchedule } from '../../../utils/scheduleTransform'

interface EditGroupDialogProps {
  isOpen: boolean
  group: EnrichedGroupPublic
  onClose: () => void
  onSave: (data: UpdateGroupDTO & { name?: string; notes?: string; status?: 'active' | 'inactive' | 'completed' }) => Promise<void>
}

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function EditGroupDialog({ isOpen, group, onClose, onSave }: EditGroupDialogProps) {
  const [name, setName] = useState(group.name || '')
  const [instructorId, setInstructorId] = useState(String(group.instructor_id ?? ''))
  const [day, setDay] = useState(group.schedule?.day || '')
  const [startTime, setStartTime] = useState(group.schedule?.start_time?.slice(0, 5) || '')
  const [endTime, setEndTime] = useState(group.schedule?.end_time?.slice(0, 5) || '')
  const [capacity, setCapacity] = useState(group.capacity ?? 12)
  const [status, setStatus] = useState<'active' | 'inactive' | 'completed'>(group.status || 'inactive')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { data: instructors = [], isLoading: isLoadingEmployees } = useAllEmployees()

  useEffect(() => {
    if (isOpen) {
      setName(group.name || '')
      setInstructorId(String(group.instructor_id ?? ''))
      setDay(group.schedule?.day || '')
      setStartTime(group.schedule?.start_time?.slice(0, 5) || '')
      setEndTime(group.schedule?.end_time?.slice(0, 5) || '')
      setCapacity(group.capacity ?? 12)
      setStatus(group.status || 'inactive')
    }
  }, [isOpen, group])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave({
        name,
        instructor_id: Number(instructorId),
        schedule: formToSchedule(day, formatTimeInput(startTime) ?? '', formatTimeInput(endTime) ?? ''),
        capacity,
        status,
        notes: notes || undefined,
      })
      onClose()
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Edit Group</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              disabled={isLoadingEmployees}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select day</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-4">
              {(['active', 'inactive', 'completed'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional notes about this group..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
