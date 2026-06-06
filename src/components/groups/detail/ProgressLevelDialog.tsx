import { useEffect, useRef } from 'react'
import { X, ArrowRightCircle, Users, BookOpen, Calendar as CalendarIcon, DollarSign, CheckCircle2 } from 'lucide-react'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { useProgressLevelForm } from '../../../hooks/useProgressLevelForm'
import { SearchablePillSelector } from '../../common/SearchablePillSelector'
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
  triggerRef?: React.RefObject<HTMLElement | null>
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
  triggerRef,
}: ProgressLevelDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
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
  } = useProgressLevelForm(groupId, undefined, isOpen)

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
        auto_migrate_enrollments: true,
        complete_current_level: true,
      })
    }
  }, [isOpen, currentLevelNumber, currentInstructorId, currentCourseId, currentGroupName, currentPriceOverride, resetForm])

  // Focus trap and focus return
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const dialog = dialogRef.current
    const trigger = triggerRef?.current
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    dialog.addEventListener('keydown', handleTab)
    return () => {
      dialog.removeEventListener('keydown', handleTab)
      trigger?.focus()
    }
  }, [isOpen, triggerRef])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    await onConfirm(toApiRequest())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        ref={dialogRef} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="progress-level-title" 
        className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 bg-surface-container-lowest border-b border-surface-container-low">
          <div>
            <h2 id="progress-level-title" className="text-xl font-headline font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightCircle className="w-6 h-6 text-secondary" />
              Progress Group Level
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Advance this group to the next level and generate new sessions.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg transition-colors" aria-label="Close dialog">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form id="progress-level-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 bg-surface">
          
          {/* Level Identity */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              Level Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-lowest p-4 rounded-lg border border-surface-container-low">
              
              <div>
                <label htmlFor="target-level" className="block text-sm font-medium text-slate-700 mb-1">
                  Target Level <span className="text-red-500">*</span>
                </label>
                <input
                  id="target-level"
                  type="number"
                  min={currentLevelNumber + 1}
                  value={formData.target_level}
                  onChange={(e) => setTargetLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Must be {'>'} {currentLevelNumber}
                </p>
              </div>

              <div>
                <label htmlFor="progress-group-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Group Name Override
                </label>
                <input
                  id="progress-group-name"
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={currentGroupName}
                  maxLength={255}
                  className="w-full px-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course
                </label>
                <SearchablePillSelector
                  options={courses.map(c => ({ id: c.id, label: c.name, subLabel: c.category }))}
                  value={formData.course_id ?? null}
                  onChange={(val) => setCourseId(val ? Number(val) : null)}
                  placeholder="-- Keep Current --"
                  disabled={isLoadingCourses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Instructor
                </label>
                <SearchablePillSelector
                  options={employees.map(emp => ({ id: emp.id, label: emp.full_name, subLabel: emp.job_title }))}
                  value={formData.instructor_id ?? null}
                  onChange={(val) => setInstructorId(val ? Number(val) : null)}
                  placeholder="-- Keep Current --"
                  disabled={isLoadingEmployees}
                />
              </div>

            </div>
          </section>

          {/* Pricing & Scheduling */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-secondary" />
              Scheduling & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-lowest p-4 rounded-lg border border-surface-container-low">
              
              <div>
                <label htmlFor="progress-start-date" className="block text-sm font-medium text-slate-700 mb-1">
                  Session Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="progress-start-date"
                    type="date"
                    value={formData.session_start_date}
                    onChange={(e) => setSessionStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                    required
                  />
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-1 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="progress-price" className="block text-sm font-medium text-slate-700 mb-1">
                  Price Override
                </label>
                <div className="relative">
                  <input
                    id="progress-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.price_override ?? ''}
                    onChange={(e) => setPriceOverride(e.target.value ? Number(e.target.value) : null)}
                    placeholder="Course Default"
                    className="w-full pl-9 pr-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-1 top-2.5 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to use course default
                </p>
              </div>

            </div>
          </section>

          {/* Lifecycle Actions */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              Lifecycle Actions
            </h3>
            <div className="flex flex-col gap-3">
              
              <label className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                formData.auto_migrate_enrollments 
                  ? 'bg-secondary/5 border-secondary/30 ring-1 ring-secondary/20' 
                  : 'bg-surface-container-lowest border-surface-container-low hover:border-surface-container-highest'
              }`}>
                <div className="flex-1">
                  <span className="block text-sm font-bold text-slate-900">Auto-migrate active enrollments</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Move current active students directly into this new level.</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                  formData.auto_migrate_enrollments ? 'bg-secondary' : 'bg-slate-300'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.auto_migrate_enrollments ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
                {/* Hidden input for accessibility */}
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.auto_migrate_enrollments}
                  onChange={(e) => setAutoMigrateEnrollments(e.target.checked)}
                />
              </label>

              <label className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                formData.complete_current_level 
                  ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100' 
                  : 'bg-surface-container-lowest border-surface-container-low hover:border-surface-container-highest'
              }`}>
                <div className="flex-1">
                  <span className="block text-sm font-bold text-slate-900">Complete current level</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Mark the current level (Level {currentLevelNumber}) as completed.</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                  formData.complete_current_level ? 'bg-emerald-500' : 'bg-slate-300'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center ${
                    formData.complete_current_level ? 'translate-x-4' : 'translate-x-0'
                  }`}>
                    {formData.complete_current_level && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.complete_current_level}
                  onChange={(e) => setCompleteCurrentLevel(e.target.checked)}
                />
              </label>

            </div>
          </section>

        </form>

        <div className="p-6 bg-surface-container-lowest border-t border-surface-container-low flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-surface-container rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="progress-level-form"
            disabled={isLoading || !isValid}
            className="px-6 py-2 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            Confirm Progression
          </button>
        </div>
      </div>
    </div>
  )
}
