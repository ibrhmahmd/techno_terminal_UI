import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { LoadingSpinner, PillSelector } from '../common'
import { DateInput } from '../common/DateInput'
import { ParentSearchDropdown } from './ParentSearchDropdown'
import type { CreateStudentDTO, ParentListItem, StudentStatus } from '../../api/crm'

type CreateStudentInput = CreateStudentDTO

interface StudentFormProps {
  initialData?: Partial<CreateStudentDTO>
  initialStatus?: StudentStatus
  onSubmit: (data: CreateStudentInput, selectedParent: ParentListItem | null, status: StudentStatus) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  onSearchParents?: (query: string) => Promise<ParentListItem[]>
}

export function StudentForm({ initialData, initialStatus = 'active', onSubmit, onCancel, mode, onSearchParents }: StudentFormProps) {
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
      
      await onSubmit(submitData, mode === 'create' ? selectedParent : null, statusValue)
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
            <span className="font-medium">Please consider adding:</span>
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
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          ref={nameInputRef}
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter student's full name"
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Phone + Birth Date - 2 column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-on-surface">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="+20 123 456 7890"
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Birth Date */}
        <DateInput
          id="date_of_birth"
          label="Birth Date"
          value={formData.date_of_birth}
          onChange={(value) => handleChange('date_of_birth', value || '')}
          disabled={isLoading}
        />
      </div>

      {/* Gender - half width */}
      <div className="sm:w-1/2">
        <PillSelector
          label="Gender"
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
        label="Status"
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
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about the student..."
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === 'create' ? 'Create Student' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
