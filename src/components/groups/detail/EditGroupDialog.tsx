import { useState, useEffect, useRef } from 'react'
import { X, Calendar as CalendarIcon, BookOpen, Clock, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { type EnrichedGroupPublic, type UpdateGroupDTO } from '../../../api/academics'
import { useAllEmployees } from '../../../hooks/useAllEmployees'
import { useCourses } from '../../../hooks/useCourses'
import { formatTimeInput } from '../../../utils/formatting'
import { SearchablePillSelector } from '../../common/SearchablePillSelector'
import { getTranslatedDays } from '../../../utils/dayTranslation'

interface EditGroupDialogProps {
  isOpen: boolean
  group: EnrichedGroupPublic
  onClose: () => void
  onSave: (data: UpdateGroupDTO) => Promise<void>
  triggerRef?: React.RefObject<HTMLElement | null>
}

const STATUSES = ['active', 'inactive', 'archived', 'completed']

export function EditGroupDialog({ isOpen, group, onClose, onSave, triggerRef }: EditGroupDialogProps) {
  const { t } = useTranslation('groups')
  const translatedDays = getTranslatedDays(t)
  const [name, setName] = useState(group.name || '')
  const [courseId, setCourseId] = useState<string | number | null>(group.course_id ?? null)
  const [instructorId, setInstructorId] = useState<string | number | null>(group.instructor_id ?? null)
  const [day, setDay] = useState(group.schedule?.day || '')
  const [startTime, setStartTime] = useState(group.schedule?.start_time?.slice(0, 5) || '')
  const [endTime, setEndTime] = useState(group.schedule?.end_time?.slice(0, 5) || '')
  const [capacity, setCapacity] = useState(group.capacity ?? 12)
  const [status, setStatus] = useState(group.status || 'active')
  const [notes, setNotes] = useState(group.notes || '')
  const [isLoading, setIsLoading] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const { data: instructors = [], isLoading: isLoadingEmployees } = useAllEmployees()
  const { courses, isLoading: isLoadingCourses } = useCourses()

  useEffect(() => {
    if (isOpen) {
      setName(group.name || '')
      setCourseId(group.course_id ?? null)
      setInstructorId(group.instructor_id ?? null)
      setDay(group.schedule?.day || '')
      setStartTime(group.schedule?.start_time?.slice(0, 5) || '')
      setEndTime(group.schedule?.end_time?.slice(0, 5) || '')
      setCapacity(group.capacity ?? 12)
      setStatus(group.status || 'active')
      setNotes(group.notes || '')
    }
  }, [isOpen, group])

  // Focus trap and focus return
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const dialog = dialogRef.current
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
    const triggerEl = triggerRef?.current
    dialog.addEventListener('keydown', handleTab)
    return () => {
      dialog.removeEventListener('keydown', handleTab)
      triggerEl?.focus()
    }
  }, [isOpen, triggerRef])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formattedStart = formatTimeInput(startTime)
      const formattedEnd = formatTimeInput(endTime)
      
      const updateData: UpdateGroupDTO = {
        name,
        max_capacity: capacity,
        status,
        ...(instructorId ? { instructor_id: Number(instructorId) } : {}),
        ...(courseId ? { course_id: Number(courseId) } : {}),
      }

      if (day) updateData.default_day = day
      if (formattedStart) updateData.default_time_start = formattedStart
      if (formattedEnd) updateData.default_time_end = formattedEnd
      if (notes) updateData.notes = notes

      await onSave(updateData)
      onClose()
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        ref={dialogRef} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="edit-group-title" 
        className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 bg-surface-container-lowest border-b border-surface-container-low">
          <div>
            <h2 id="edit-group-title" className="text-xl font-headline font-bold text-slate-900">
              {t('editGroupDialog.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('editGroupDialog.subtitle')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-lg transition-colors" aria-label={t('editGroupDialog.close_aria')}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form id="edit-group-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 bg-surface">
          
          {/* General Settings */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              {t('editGroupDialog.general_config')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-lowest p-4 rounded-lg border border-surface-container-low">
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="group-name" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.group_name')}
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.course')}
                </label>
                <SearchablePillSelector
                  options={courses.map(c => ({ id: c.id, label: c.name, subLabel: c.category }))}
                  value={courseId}
                  onChange={setCourseId}
                  placeholder={t('editGroupDialog.search_courses')}
                  disabled={isLoadingCourses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.instructor')}
                </label>
                <SearchablePillSelector
                  options={instructors.map(emp => ({ id: emp.id, label: emp.full_name, subLabel: emp.job_title }))}
                  value={instructorId}
                  onChange={setInstructorId}
                  placeholder={t('editGroupDialog.search_instructors')}
                  disabled={isLoadingEmployees}
                />
              </div>

              <div>
                <label htmlFor="capacity-input" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.max_capacity')}
                </label>
                <input
                  id="capacity-input"
                  type="number"
                  min="1"
                  max="50"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('editGroupDialog.group_status')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => {
                    const isSelected = status === s
                    let colorClasses = ''
                    
                    if (isSelected) {
                      if (s === 'active') colorClasses = 'bg-teal-100 text-teal-800 ring-1 ring-teal-500 font-semibold'
                      else if (s === 'completed') colorClasses = 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500 font-semibold'
                      else colorClasses = 'bg-red-100 text-red-800 ring-1 ring-red-500 font-semibold'
                    } else {
                      colorClasses = 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-700'
                    }

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s as 'active' | 'inactive' | 'completed')}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${colorClasses} capitalize flex items-center gap-1.5`}
                      >
                        {s === 'active' && isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                        {s === 'completed' && isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {s === 'inactive' && isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                        {s === 'archived' && isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Schedule Settings */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-secondary" />
              {t('editGroupDialog.default_schedule')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-lg border border-surface-container-low">
              <div>
                <label htmlFor="schedule-day" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.day')}
                </label>
                <select
                  id="schedule-day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                >
                  <option value="">{t('editGroupDialog.no_default_day')}</option>
                  {translatedDays.map((d) => (
                    <option key={d.api} value={d.api}>{d.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.start_time')}
                </label>
                <div className="relative">
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute start-1 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('editGroupDialog.end_time')}
                </label>
                <div className="relative">
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute start-1 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-secondary" />
              {t('editGroupDialog.additional_notes')}
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('editGroupDialog.notes_placeholder')}
              className="w-full px-3 py-3 bg-surface-container-lowest border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none min-h-[100px] resize-y transition-all rounded-none"
            />
          </section>
        </form>

        <div className="p-6 bg-surface-container-lowest border-t border-surface-container-low flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-surface-container rounded-lg transition-colors"
            disabled={isLoading}
          >
            {t('editGroupDialog.cancel')}
          </button>
          <button
            type="submit"
            form="edit-group-form"
            disabled={isLoading}
            className="px-6 py-2 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            {t('editGroupDialog.save_changes')}
          </button>
        </div>
      </div>
    </div>
  )
}
