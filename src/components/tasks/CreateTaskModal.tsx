import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateTaskInput, TaskPriority, TaskRecurrencePattern } from '../../api/tasks'
import { TASK_PRIORITIES, TASK_RECURRENCE_PATTERNS } from '../../api/tasks'
import { useCreateTask } from '../../hooks/useTasks'
import { useEmployees } from '../../hooks/useEmployees'
import { useToast } from '../common/Toast'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { t } = useTranslation('tasks')
  const { showToast, ToastComponent } = useToast()
  const createMutation = useCreateTask()
  const { employees } = useEmployees()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      const timer = setTimeout(() => {
        modalRef.current?.querySelector<HTMLElement>('input, select, textarea')?.focus()
      }, 0)
      return () => clearTimeout(timer)
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<TaskRecurrencePattern>('weekly')
  const [recurrenceIntervalDays, setRecurrenceIntervalDays] = useState('')
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState('')

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setAssignedTo('')
    setEstimatedHours('')
    setTagsInput('')
    setIsRecurring(false)
    setRecurrencePattern('weekly')
    setRecurrenceIntervalDays('')
    setRecurrenceDayOfWeek('')
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)

    const data: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
      assigned_to: assignedTo ? parseInt(assignedTo, 10) : null,
      estimated_hours: estimatedHours ? (parseFloat(estimatedHours) || null) : null,
      tags,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_interval_days: isRecurring && recurrenceIntervalDays ? (parseInt(recurrenceIntervalDays, 10) || null) : null,
      recurrence_day_of_week: isRecurring && recurrenceDayOfWeek !== '' ? (parseInt(recurrenceDayOfWeek, 10) || null) : null,
    }

    try {
      await createMutation.mutateAsync(data)
      showToast(t('toast.created_successfully'), 'success')
      resetForm()
      onClose()
    } catch {
      showToast(t('toast.create_failed'), 'error')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {ToastComponent}
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-task-title"
          onKeyDown={handleKeyDown}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 id="create-task-title" className="text-lg font-semibold text-slate-900 font-headline">{t('create_modal.title')}</h2>
            <button onClick={onClose} aria-label="Close create task dialog" className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.title_label')}</label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('create_modal.title_placeholder')}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.description_label')}</label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('create_modal.description_placeholder')}
                rows={3}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>

            {/* Priority + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.priority_label')}</label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.due_date_label')}</label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.assign_to_label')}</label>
              <select
                id="task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">{t('create_modal.unassigned')}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            {/* Est. Hours + Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-est-hours" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.est_hours_label')}</label>
                <input
                  id="task-est-hours"
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label htmlFor="task-tags" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.tags_label')}</label>
                <input
                  id="task-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={t('create_modal.tags_placeholder')}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Recurring */}
            <div className="border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">{t('create_modal.recurring_task')}</span>
              </label>

              {isRecurring && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="task-recurrence-pattern" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.pattern_label')}</label>
                    <select
                      id="task-recurrence-pattern"
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value as TaskRecurrencePattern)}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      {TASK_RECURRENCE_PATTERNS.map((p) => (
                        <option key={p} value={p}>{p.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  {recurrencePattern === 'weekly' && (
                    <div>
                      <label htmlFor="task-recurrence-day" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.day_of_week_label')}</label>
                      <select
                        id="task-recurrence-day"
                        value={recurrenceDayOfWeek}
                        onChange={(e) => setRecurrenceDayOfWeek(e.target.value)}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="">{t('create_modal.any')}</option>
                        <option value="0">Sunday</option>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                      </select>
                    </div>
                  )}
                  {recurrencePattern === 'custom_interval' && (
                    <div>
                      <label htmlFor="task-recurrence-interval" className="block text-sm font-medium text-slate-700 mb-1">{t('create_modal.interval_days_label')}</label>
                      <input
                        id="task-recurrence-interval"
                        type="number"
                        value={recurrenceIntervalDays}
                        onChange={(e) => setRecurrenceIntervalDays(e.target.value)}
                        placeholder="7"
                        min="1"
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {t('create_modal.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? t('create_modal.creating') : t('create_modal.create_task')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
