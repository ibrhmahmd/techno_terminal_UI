import { useState, type FormEvent } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
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
    status: initialStatus,
  })
  const [selectedParent, setSelectedParent] = useState<ParentListItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        throw new Error('Full name is required')
      }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-on-surface">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          placeholder="Enter student's full name"
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Birth Date */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="date_of_birth" className="text-sm font-medium text-on-surface">
          Birth Date
        </label>
        <input
          id="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleChange('date_of_birth', e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="gender" className="text-sm font-medium text-on-surface">
          Gender
        </label>
        <select
          id="gender"
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

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
          placeholder="+20 123 456 7890"
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Notes */}
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

      {/* Status - shown in both create and edit modes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-on-surface">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
        >
          <option value="active">Active</option>
          <option value="waiting">Waiting List</option>
          <option value="inactive">Inactive</option>
        </select>
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
