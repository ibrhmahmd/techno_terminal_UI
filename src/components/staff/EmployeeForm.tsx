import { useState, type FormEvent } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { EmployeePublic, EmployeeCreateInput } from '../../api/hr'
import { PersonalInfoSection } from './EmployeeForm/PersonalInfoSection'
import { WorkSettingsSection } from './EmployeeForm/WorkSettingsSection'

interface EmployeeFormProps {
  initialData?: Partial<EmployeePublic>
  onSubmit: (data: EmployeeCreateInput) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  isLoading?: boolean
  apiError?: string | null
}

export function EmployeeForm({ initialData, onSubmit, onCancel, mode, isLoading: isExternalLoading, apiError }: EmployeeFormProps) {
  const [formData, setFormData] = useState<{
    full_name: string
    email: string
    phone: string
    national_id: string
    university: string
    major: string
    is_graduate: boolean
    job_title: string
    employment_type: 'full_time' | 'part_time' | 'contract'
    monthly_salary: number
    contract_percentage: number | undefined
    is_active: boolean
  }>({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    national_id: initialData?.national_id || '', // Required for create, included in edit if available
    university: '',
    major: '',
    is_graduate: false,
    job_title: initialData?.job_title || '',
    employment_type: (initialData?.employment_type as 'full_time' | 'part_time' | 'contract') || 'full_time',
    monthly_salary: 0,
    contract_percentage: undefined,
    is_active: initialData?.is_active ?? true,
  })
  
  const [isInternalLoading, setIsInternalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoading = isExternalLoading || isInternalLoading

  // Combine internal validation errors with API errors
  const displayError = error || apiError || null

  const handleChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear internal error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.full_name.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields: full name and phone')
      return
    }
    
    if (mode === 'create' && !formData.national_id.trim()) {
      setError('National ID is required when creating a new employee')
      return
    }

    setIsInternalLoading(true)
    try {
      // Build API data based on mode
      let apiData: EmployeeCreateInput
      
      if (mode === 'create') {
        // Create requires all mandatory fields including national_id
        apiData = {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || undefined,
          national_id: formData.national_id,
          university: formData.university || 'Not Specified',
          major: formData.major || 'Not Specified',
          is_graduate: formData.is_graduate,
          job_title: formData.job_title,
          employment_type: formData.employment_type,
          monthly_salary: formData.monthly_salary || undefined,
          contract_percentage: formData.contract_percentage,
          is_active: formData.is_active,
        }
      } else {
        // Update is partial - only send fields with actual values
        // Don't send 'Not Specified' placeholders as they may fail validation
        apiData = {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || undefined,
          // Include national_id if we have it (backend requires it)
          ...(formData.national_id?.trim() && { national_id: formData.national_id }),
          // Only include university/major if they have real values
          ...(formData.university?.trim() && formData.university !== 'Not Specified'
            ? { university: formData.university }
            : {}),
          ...(formData.major?.trim() && formData.major !== 'Not Specified'
            ? { major: formData.major }
            : {}),
          is_graduate: formData.is_graduate,
          job_title: formData.job_title,
          employment_type: formData.employment_type,
          monthly_salary: formData.monthly_salary || undefined,
          contract_percentage: formData.contract_percentage,
          is_active: formData.is_active,
        }
      }

      await onSubmit(apiData)
    } catch {
      setError('An error occurred while saving the employee profile.')
    } finally {
      setIsInternalLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-3 no-scrollbar">
      {displayError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 animate-shake">
          <span className="material-symbols-outlined">error</span>
          <span className="font-medium">{displayError}</span>
        </div>
      )}
      

      {/* Profile Sections */}
      <PersonalInfoSection 
        formData={formData} 
        onChange={handleChange} 
        isLoading={isLoading} 
      />

      <WorkSettingsSection
        formData={formData}
        onChange={handleChange}
        onStatusChange={(is_active) => setFormData({ ...formData, is_active })}
        mode={mode}
        isLoading={isLoading}
      />

      {/* Footer Controls */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-secondary rounded-xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-[18px]">save</span>}
          {mode === 'create' ? 'Create Profile' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
