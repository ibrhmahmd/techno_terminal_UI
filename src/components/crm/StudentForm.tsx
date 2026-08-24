import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner, PillSelector } from '../common'
import { DateInput } from '../common/DateInput'
import { ParentSearchDropdown } from './ParentSearchDropdown'
import type { CreateStudentDTO, ParentListItem, StudentStatus } from '../../api/crm'

type CreateStudentInput = CreateStudentDTO

interface StudentFormProps {
  initialData?: Partial<CreateStudentDTO>
  initialStatus?: StudentStatus
  onSubmit: (
    data: CreateStudentInput,
    selectedParent: ParentListItem | null,
    status: StudentStatus,
    initialActivity?: { activity_type: string; description: string }
  ) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  onSearchParents?: (query: string) => Promise<ParentListItem[]>
}

export function StudentForm({ initialData, initialStatus = 'active', onSubmit, onCancel, mode, onSearchParents }: StudentFormProps) {
  const { t } = useTranslation('directory')
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || '',
    phone: initialData?.phone || '',
    notes: initialData?.notes || '',
    status: initialStatus || 'waiting',
  })
  const [warnings, setWarnings] = useState<string[]>([])
  const [selectedParent, setSelectedParent] = useState<ParentListItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initial Activity Log State
  const [addInitialActivity, setAddInitialActivity] = useState(false)
  const [activityType, setActivityType] = useState('note_added')
  const [activityDescription, setActivityDescription] = useState('')

  // Ref for auto-focus on name input
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus name input on mount
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        throw new Error('Full name is required')
      }
      if (!formData.gender) {
        throw new Error('Gender is required')
      }

      // Check for recommended fields (warnings only)
      const newWarnings: string[] = []
      if (!formData.phone) {
        newWarnings.push('Phone is recommended')
      }
      if (!formData.date_of_birth) {
        newWarnings.push('Birth date is recommended')
      }
      setWarnings(newWarnings)

      // Build submission data with all required fields
      const genderValue = formData.gender as 'male' | 'female' | ''
      const statusValue = formData.status as StudentStatus
      const submitData: CreateStudentInput = {
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        gender: genderValue || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
      }
      
      await onSubmit(
        submitData,
        mode === 'create' ? selectedParent : null,
        statusValue,
        addInitialActivity && activityDescription.trim()
          ? { activity_type: activityType, description: activityDescription.trim() }
          : undefined
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle Enter key to submit form (not for textarea)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Trigger form submission by clicking the submit button's form
      const form = e.currentTarget.form
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
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

      {/* Warnings */}
      {warnings.length > 0 && !error && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
          <span className="material-symbols-outlined text-lg">warning</span>
          <div>
            <span className="font-medium">{t('student_form.please_consider_adding')}</span>
            <ul className="mt-1 ml-4 list-disc">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-on-surface">
          {t('student_form.full_name_label')} <span className="text-red-500">*</span>
        </label>
        <input
          ref={nameInputRef}
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('student_form.full_name_placeholder')}
          required
          disabled={isLoading}
          className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Phone + Birth Date - 2 column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-on-surface">
            {t('student_form.phone_label')}
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('student_form.phone_placeholder')}
            disabled={isLoading}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Birth Date */}
        <DateInput
          id="date_of_birth"
          label={t('student_form.birth_date_label')}
          value={formData.date_of_birth}
          onChange={(value) => handleChange('date_of_birth', value || '')}
          disabled={isLoading}
        />
      </div>

      {/* Gender - half width */}
      <div className="sm:w-1/2">
        <PillSelector
          label={t('student_form.gender_label')}
          value={formData.gender || ''}
          onChange={(value) => handleChange('gender', value || '')}
          disabled={isLoading}
          required
          options={[
            { value: 'male', label: 'Male', dotColor: 'bg-blue-500' },
            { value: 'female', label: 'Female', dotColor: 'bg-pink-500' },
          ]}
        />
      </div>

      {/* Status - full width */}
      <PillSelector
        label={t('student_form.status_label')}
        value={formData.status}
        onChange={(value) => handleChange('status', value as StudentStatus)}
        disabled={isLoading}
        options={[
          { value: 'active', label: 'Active', dotColor: 'bg-green-500' },
          { value: 'waiting', label: 'Waiting', dotColor: 'bg-amber-500' },
          { value: 'inactive', label: 'Inactive', dotColor: 'bg-slate-500' },
        ]}
      />

      {/* Notes - full width */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-on-surface">
          {t('student_form.notes_label')}
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder={t('student_form.notes_placeholder')}
          rows={3}
          disabled={isLoading}
          className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {/* Parent Selection - only for create mode */}
      {mode === 'create' && onSearchParents && (
        <ParentSearchDropdown
          onSelect={setSelectedParent}
          selectedParent={selectedParent}
          onSearchParents={onSearchParents}
        />
      )}

      {/* Initial Activity Log Section (Create Mode Only) */}
      {mode === 'create' && (
        <div className="bg-surface-container-low p-4 rounded-[6px] space-y-4">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addInitialActivity}
              onChange={(e) => setAddInitialActivity(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded text-secondary focus:ring-secondary/20 border-slate-300 transition-all cursor-pointer"
            />
            <span className="text-sm font-medium text-on-surface">
              {t('student_form.log_initial_activity')}
            </span>
          </label>

          {addInitialActivity && (
            <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-100 animate-fadeIn">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="activity_type" className="text-sm font-medium text-on-surface">
                  {t('student_form.activity_type_label')}
                </label>
                <select
                  id="activity_type"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="note_added">Note Added</option>
                  <option value="registration">Registration</option>
                  <option value="status_change">Status Change</option>
                  <option value="enrollment">Enrollment</option>
                  <option value="payment">Payment</option>
                  <option value="competition">Competition</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="activity_description" className="text-sm font-medium text-on-surface">
                  {t('student_form.activity_description_label')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="activity_description"
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder={t('student_form.activity_description_placeholder')}
                  rows={2}
                  required={addInitialActivity}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-[6px] hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('student_form.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-[6px] hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === 'create' ? t('student_form.create_student') : t('student_form.save_changes')}
        </button>
      </div>
    </form>
  )
}
