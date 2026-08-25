import { useEffect, useRef, useState } from 'react'
import { X, Edit3, DollarSign, StickyNote } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCoursesPaginated } from '../../../api/academics'
import { getEmployees } from '../../../api/hr'
import { queryKeys } from '../../../hooks/queryKeys'
import { SearchablePillSelector } from '../../common/SearchablePillSelector'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import type { EmployeePublic } from '../../../api/hr/types'
import type { Course } from '../../../api/academics/types/courses'

interface EditGroupLevelDialogProps {
  isOpen: boolean
  levelNumber: number
  currentInstructorId: number | null | undefined
  currentCourseId: number | null | undefined
  currentPriceOverride: number | null | undefined
  currentNotes: string | null | undefined
  onClose: () => void
  onConfirm: (data: {
    instructor_id: number | null
    course_id: number | null
    price_override: number | null
    notes: string | null
  }) => Promise<void>
  isLoading: boolean
  triggerRef?: React.RefObject<HTMLElement | null>
}

export function EditGroupLevelDialog({
  isOpen,
  levelNumber,
  currentInstructorId,
  currentCourseId,
  currentPriceOverride,
  currentNotes,
  onClose,
  onConfirm,
  isLoading,
  triggerRef,
}: EditGroupLevelDialogProps) {
  const { t } = useTranslation('groups')
  const dialogRef = useRef<HTMLDivElement>(null)
  
  const [instructorId, setInstructorId] = useState<number | null>(null)
  const [courseId, setCourseId] = useState<number | null>(null)
  const [priceOverride, setPriceOverride] = useState<number | null>(null)
  const [notes, setNotes] = useState<string>('')

  // Fetch courses for selector
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: queryKeys.courses,
    queryFn: async () => {
      const result = await getCoursesPaginated({ skip: 0, limit: 100 })
      return result.items || []
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch employees (instructors) for selector
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: async () => {
      const result = await getEmployees({ page: 1, page_size: 100 })
      return (result.data || []) as EmployeePublic[]
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const courses = coursesData || []
  const employees = employeesData || []

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      setInstructorId(currentInstructorId ?? null)
      setCourseId(currentCourseId ?? null)
      setPriceOverride(currentPriceOverride ?? null)
      setNotes(currentNotes ?? '')
    }
  }, [isOpen, currentInstructorId, currentCourseId, currentPriceOverride, currentNotes])

  // Focus trap
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
    await onConfirm({
      instructor_id: instructorId,
      course_id: courseId,
      price_override: priceOverride,
      notes: notes.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        ref={dialogRef} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="edit-level-title" 
        className="relative bg-surface rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 bg-surface-container-lowest border-b border-surface-container-low">
          <div>
            <h2 id="edit-level-title" className="text-xl font-headline font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-secondary" />
              {t('editLevelDialog.title', { level: levelNumber })}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('editLevelDialog.subtitle')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg transition-colors" aria-label={t('editLevelDialog.close_aria')}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface">
          {/* Course Assignment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('editLevelDialog.course')}
            </label>
            <SearchablePillSelector
              options={courses.map(c => ({ id: c.id, label: c.name, subLabel: c.category }))}
              value={courseId}
              onChange={(val) => setCourseId(val ? Number(val) : null)}
              placeholder={t('editLevelDialog.keep_current')}
              disabled={isLoadingCourses}
            />
          </div>

          {/* Instructor Assignment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('editLevelDialog.instructor')}
            </label>
            <SearchablePillSelector
              options={employees.map(emp => ({ id: emp.id, label: emp.full_name, subLabel: emp.job_title }))}
              value={instructorId}
              onChange={(val) => setInstructorId(val ? Number(val) : null)}
              placeholder={t('editLevelDialog.keep_current')}
              disabled={isLoadingEmployees}
            />
          </div>

          {/* Price Override */}
          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium text-slate-700 mb-1">
              {t('editLevelDialog.price_override')}
            </label>
            <div className="relative">
              <input
                id="edit-price"
                type="number"
                min={0}
                step={0.01}
                value={priceOverride ?? ''}
                onChange={(e) => setPriceOverride(e.target.value ? Number(e.target.value) : null)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                placeholder={t('editLevelDialog.no_price_override')}
                className="w-full ps-9 pe-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
              />
              <DollarSign className="w-4 h-4 text-slate-400 absolute start-1 top-2.5 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('editLevelDialog.price_hint')}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-700 mb-1">
              {t('editLevelDialog.internal_notes')}
            </label>
            <div className="relative">
              <textarea
                id="edit-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('editLevelDialog.notes_placeholder')}
                maxLength={500}
                className="w-full ps-9 pe-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none resize-none"
              />
              <StickyNote className="w-4 h-4 text-slate-400 absolute start-1 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-low">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {t('editLevelDialog.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-lg transition-colors flex items-center gap-2"
              disabled={isLoading || isLoadingCourses || isLoadingEmployees}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" variant="light" />
                  {t('editLevelDialog.saving')}
                </>
              ) : (
                t('editLevelDialog.save_changes')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
