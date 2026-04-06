import { useState, type FormEvent } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../../api/hr'

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
    university: '', // Required by hr.md
    major: '',      // Required by hr.md
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

    // Validation
    if (!formData.full_name.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.phone.trim()) {
      setError('Phone is required')
      return
    }
    if (!formData.national_id.trim()) {
      setError('National ID is required')
      return
    }

    setIsInternalLoading(true)
    try {
      // Map to API compliant structure
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
      setError(`Failed to ${mode} employee`)
    } finally {
      setIsInternalLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Personal Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Enter full name..."
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="01xxxxxxxxx"
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            National ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.national_id}
            onChange={(e) => handleChange('national_id', e.target.value)}
            placeholder="290xxxxxxxxxxx"
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">University</label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => handleChange('university', e.target.value)}
            placeholder="Enter university..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Major</label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => handleChange('major', e.target.value)}
            placeholder="Enter major..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_graduate"
          checked={formData.is_graduate}
          onChange={(e) => handleChange('is_graduate', e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-secondary border-slate-200 rounded focus:ring-secondary"
        />
        <label htmlFor="is_graduate" className="text-sm font-medium text-on-surface cursor-pointer">
          Is Graduate
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Date of Birth</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Hire Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.hire_date}
            onChange={(e) => handleChange('hire_date', e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter address..."
          rows={2}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>

      {/* Employment Info */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="font-medium text-on-surface mb-3">Employment Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => handleChange('job_title', e.target.value)}
              placeholder="e.g., Instructor"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.employment_type}
            onChange={(e) => handleChange('employment_type', e.target.value as 'full_time' | 'part_time' | 'contract')}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Salary (EGP) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={formData.salary}
            onChange={(e) => handleChange('salary', parseInt(e.target.value, 10) || 0)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {mode === 'edit' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          >
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={2}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === 'create' ? 'Add Employee' : 'Update Employee'}
        </button>
      </div>
    </form>
  )
}
