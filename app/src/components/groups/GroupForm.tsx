import { useState, FormEvent } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Group } from '../../api/academics'

interface GroupFormProps {
  initialData?: Partial<Group>
  onSubmit: (data: Partial<Omit<Group, 'id'>>) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
}

export function GroupForm({ initialData, onSubmit, onCancel, mode }: GroupFormProps) {
  const [formData, setFormData] = useState<Partial<Group>>({
    name: initialData?.name || '',
    course_name: initialData?.course_name || '',
    instructor_name: initialData?.instructor_name || '',
    level: initialData?.level || 1,
    schedule_time: initialData?.schedule_time || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof Group, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!formData.name?.trim()) {
      setError('Group name is required')
      setIsLoading(false)
      return
    }
    if (!formData.course_name?.trim()) {
      setError('Course name is required')
      setIsLoading(false)
      return
    }
    if (!formData.instructor_name?.trim()) {
      setError('Instructor name is required')
      setIsLoading(false)
      return
    }

    try {
      await onSubmit(formData)
    } catch {
      setError(`Failed to ${mode} group`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Group Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-on-surface">
          Group Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Robotics A"
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      {/* Course Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="course_name" className="text-sm font-medium text-on-surface">
          Course Name <span className="text-red-500">*</span>
        </label>
        <input
          id="course_name"
          type="text"
          value={formData.course_name}
          onChange={(e) => handleChange('course_name', e.target.value)}
          placeholder="e.g., Robotics"
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      {/* Instructor Name */}
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

      {/* Level and Schedule Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="level" className="text-sm font-medium text-on-surface">
            Level
          </label>
          <input
            id="level"
            type="number"
            min={1}
            value={formData.level}
            onChange={(e) => handleChange('level', parseInt(e.target.value, 10) || 1)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="schedule_time" className="text-sm font-medium text-on-surface">
            Schedule Time
          </label>
          <input
            id="schedule_time"
            type="text"
            value={formData.schedule_time}
            onChange={(e) => handleChange('schedule_time', e.target.value)}
            placeholder="e.g., Sat 15:00"
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === 'create' ? 'Create Group' : 'Update Group'}
        </button>
      </div>
    </form>
  )
}
