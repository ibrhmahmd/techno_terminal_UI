import { useEffect } from 'react'
import { X } from 'lucide-react'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { useProgressLevelForm } from '../../../hooks/useProgressLevelForm'
import type { ProgressGroupLevelRequest } from '../../../api/academics'

interface ProgressLevelDialogProps {
  isOpen: boolean
  groupId: number
  currentLevelNumber: number
  currentInstructorId: number
  currentCourseId: number
  currentGroupName: string
  currentPriceOverride: number | null | undefined
  onClose: () => void
  onConfirm: (data: ProgressGroupLevelRequest) => Promise<void>
  isLoading: boolean
}

export function ProgressLevelDialog({
  isOpen,
  groupId,
  currentLevelNumber,
  currentInstructorId,
  currentCourseId,
  currentGroupName,
  currentPriceOverride,
  onClose,
  onConfirm,
  isLoading,
}: ProgressLevelDialogProps) {
  const {
    formData,
    setTargetLevel,
    setInstructorId,
    setCourseId,
    setGroupName,
    setSessionStartDate,
    setPriceOverride,
    setAutoMigrateEnrollments,
    setCompleteCurrentLevel,
    resetForm,
    courses,
    employees,
    isLoadingCourses,
    isLoadingEmployees,
    isValid,
    toApiRequest,
  } = useProgressLevelForm(groupId)

  // Reset form with defaults when dialog opens
  useEffect(() => {
    if (isOpen) {
      const defaultStartDate = new Date()
      defaultStartDate.setDate(defaultStartDate.getDate() + 7)

      resetForm({
        target_level: currentLevelNumber + 1,
        instructor_id: currentInstructorId,
        course_id: currentCourseId,
        group_name: currentGroupName,
        session_start_date: defaultStartDate.toISOString().split('T')[0],
        price_override: currentPriceOverride ?? null,
        auto_migrate_enrollments: false,
        complete_current_level: false,
      })
    }
  }, [isOpen, currentLevelNumber, currentInstructorId, currentCourseId, currentGroupName, currentPriceOverride, resetForm])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    await onConfirm(toApiRequest())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Create New Level</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Target Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Target Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={currentLevelNumber + 1}
              value={formData.target_level}
              onChange={(e) => setTargetLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Must be greater than current level ({currentLevelNumber})
            </p>
          </div>

          {/* Instructor Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Instructor
            </label>
            <select
              value={formData.instructor_id ?? ''}
              onChange={(e) => setInstructorId(e.target.value ? Number(e.target.value) : null)}
              disabled={isLoadingEmployees}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            >
              <option value="">-- Keep Current --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.job_title})
                </option>
              ))}
            </select>
            {isLoadingEmployees && (
              <p className="text-xs text-slate-500 mt-1">Loading instructors...</p>
            )}
          </div>

          {/* Course Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course
            </label>
            <select
              value={formData.course_id ?? ''}
              onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : null)}
              disabled={isLoadingCourses}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
            >
              <option value="">-- Keep Current --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.category})
                </option>
              ))}
            </select>
            {isLoadingCourses && (
              <p className="text-xs text-slate-500 mt-1">Loading courses...</p>
            )}
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={formData.group_name}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={currentGroupName}
              maxLength={255}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to keep current name
            </p>
          </div>

          {/* Session Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Session Start Date
            </label>
            <input
              type="date"
              value={formData.session_start_date}
              onChange={(e) => setSessionStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Price Override */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price Override
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={formData.price_override ?? ''}
              onChange={(e) => setPriceOverride(e.target.value ? Number(e.target.value) : null)}
              placeholder="Use course default"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty or set to 0 to use course default price
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_migrate_enrollments}
                onChange={(e) => setAutoMigrateEnrollments(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Auto-migrate enrollments</span>
                <p className="text-xs text-slate-500">
                  Migrate active students to the new level. If unchecked, creates an empty level.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.complete_current_level}
                onChange={(e) => setCompleteCurrentLevel(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Complete current level</span>
                <p className="text-xs text-slate-500">
                  Mark current level as completed. If unchecked, current level remains active.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
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
              disabled={isLoading || !isValid}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              Create Level
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
