import { useState, type FormEvent } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../../api/hr'
import { PersonalInfoSection } from './EmployeeForm/PersonalInfoSection'
import { WorkSettingsSection } from './EmployeeForm/WorkSettingsSection'

interface EmployeeFormProps {
  initialData?: Partial<Employee>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  isLoading?: boolean
}

export function EmployeeForm({ initialData, onSubmit, onCancel, mode, isLoading: isExternalLoading }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    national_id: initialData?.national_id || '',
    university: '',
    major: '',
    is_graduate: false,
    address: initialData?.address || '',
    date_of_birth: initialData?.date_of_birth || '',
    hire_date: initialData?.hire_date || new Date().toISOString().split('T')[0],
    job_title: initialData?.job_title || '',
    employment_type: initialData?.employment_type || 'full_time',
    salary: initialData?.salary || 0,
    notes: initialData?.notes || '',
    status: initialData?.status || 'active',
    is_active: initialData?.is_active ?? true,
  })
  
  const [isInternalLoading, setIsInternalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoading = isExternalLoading || isInternalLoading

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.national_id.trim()) {
      setError('Please fill in all required personal information')
      return
    }

    setIsInternalLoading(true)
    try {
      const apiData: CreateEmployeeInput = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email || undefined,
        national_id: formData.national_id,
        university: formData.university || 'Not Specified',
        major: formData.major || 'Not Specified',
        is_graduate: formData.is_graduate,
        job_title: formData.job_title,
        employment_type: formData.employment_type as any,
        monthly_salary: formData.salary,
        is_active: formData.is_active,
        notes: formData.notes,
        hire_date: formData.hire_date
      }

      if (mode === 'edit') {
        const updateData: UpdateEmployeeInput = {
          ...apiData,
          status: formData.status as any
        }
        await onSubmit(updateData)
      } else {
        await onSubmit(apiData)
      }
    } catch (err) {
      setError(`An error occurred while saving the employee profile.`)
    } finally {
      setIsInternalLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-3 no-scrollbar">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 animate-shake">
          <span className="material-symbols-outlined">error</span>
          <span className="font-medium">{error}</span>
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
        onStatusChange={(status) => setFormData({ ...formData, status })}
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
