import { useState, type FormEvent, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { ScheduleGroupInput, Course } from '../../api/academics'
import { getCourses } from '../../api/academics'
import { useAllEmployees } from '../../hooks/useAllEmployees'

interface GroupFormProps {
  initialData?: Partial<ScheduleGroupInput>
  onSubmit: (data: ScheduleGroupInput) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
}

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]

interface TimeState {
  hour: number
  minute: string
  period: 'AM' | 'PM'
}

export function GroupForm({ initialData, onSubmit, onCancel, mode }: GroupFormProps) {
  // Decompose initial times if editing
  const parseTime = (timeStr?: string): TimeState => {
    if (!timeStr) return { hour: 3, minute: "00", period: 'PM' }
    const [h24, m] = timeStr.split(':').map(Number)
    const period = h24 >= 12 ? 'PM' : 'AM'
    let hour = h24 % 12
    if (hour === 0) hour = 12
    const minute = String(m).padStart(2, '0')
    return { hour, minute, period: period as 'AM' | 'PM' }
  }

  const [courseId, setCourseId] = useState(initialData?.course_id || '')
  const [instructorId, setInstructorId] = useState(initialData?.instructor_id || '')
  const [maxCapacity, setMaxCapacity] = useState(initialData?.max_capacity || 12)
  const [defaultDay, setDefaultDay] = useState(initialData?.default_day || 'Saturday')
  const [startTime, setStartTime] = useState<TimeState>(parseTime(initialData?.default_time_start))
  const [endTime, setEndTime] = useState<TimeState>(parseTime(initialData?.default_time_end))
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useAllEmployees()
  const instructors = allEmployees

  // Fetch courses on mount
  useEffect(() => {
    async function fetchCourses() {
      setIsFetching(true)
      try {
        const coursesData = await getCourses().catch(() => [] as Course[])
        setCourses(coursesData)
      } catch {
        // Silently fail - form will fall back to text inputs
      } finally {
        setIsFetching(false)
      }
    }
    fetchCourses()
  }, [])

  const to24h = (time: TimeState): string => {
    let h = time.hour
    if (time.period === 'PM' && h < 12) h += 12
    if (time.period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${time.minute}:00`
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!courseId) {
      setError('Course is required')
      setIsLoading(false)
      return
    }
    if (!instructorId) {
      setError('Instructor is required')
      setIsLoading(false)
      return
    }

    try {
      const payload: ScheduleGroupInput = {
        course_id: Number(courseId),
        instructor_id: Number(instructorId),
        max_capacity: maxCapacity,
        default_day: defaultDay,
        default_time_start: to24h(startTime),
        default_time_end: to24h(endTime),
      }
      await onSubmit(payload)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} group`)
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

      {/* Course - Dropdown mandatory */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="course_id" className="text-sm font-medium text-on-surface">
          Course <span className="text-red-500">*</span>
        </label>
        <select
          id="course_id"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          disabled={isLoading || isFetching}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        >
          <option value="">Select a course...</option>
          {courses.filter(c => c.is_active).map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      {/* Instructor - Dropdown mandatory */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="instructor_id" className="text-sm font-medium text-on-surface">
          Instructor <span className="text-red-500">*</span>
        </label>
        <select
          id="instructor_id"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          required
          disabled={isLoading || isFetching || isLoadingEmployees}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        >
          <option value="">Select an instructor...</option>
          {instructors.filter(i => i.is_active !== false).map(instructor => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.full_name} ({instructor.job_title})
            </option>
          ))}
        </select>
      </div>

      {/* Max Capacity and Day */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="max_capacity" className="text-sm font-medium text-on-surface">
            Max Capacity
          </label>
          <input
            id="max_capacity"
            type="number"
            min={1}
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 12)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="default_day" className="text-sm font-medium text-on-surface">
            Default Day <span className="text-red-500">*</span>
          </label>
          <select
            id="default_day"
            value={defaultDay}
            onChange={(e) => setDefaultDay(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          >
            {DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Start Time - 3 Part Selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-on-surface">Start Time</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={startTime.hour}
            onChange={(e) => setStartTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
          </select>
          <select
            value={startTime.minute}
            onChange={(e) => setStartTime(prev => ({ ...prev, minute: e.target.value }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={startTime.period}
            onChange={(e) => setStartTime(prev => ({ ...prev, period: e.target.value as 'AM' | 'PM' }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      {/* End Time - 3 Part Selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-on-surface">End Time</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={endTime.hour}
            onChange={(e) => setEndTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
          </select>
          <select
            value={endTime.minute}
            onChange={(e) => setEndTime(prev => ({ ...prev, minute: e.target.value }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={endTime.period}
            onChange={(e) => setEndTime(prev => ({ ...prev, period: e.target.value as 'AM' | 'PM' }))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
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
