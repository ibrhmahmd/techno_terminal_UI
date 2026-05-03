interface WorkSettingsSectionProps {
  formData: {
    job_title: string
    employment_type: string
    monthly_salary: number
    contract_percentage?: number
    is_active: boolean
  }
  onChange: (field: string, value: string | boolean | number | undefined) => void
  onStatusChange: (is_active: boolean) => void
  mode: 'create' | 'edit'
  isLoading?: boolean
}

export function WorkSettingsSection({ 
  formData, 
  onChange, 
  onStatusChange, 
  mode, 
  isLoading 
}: WorkSettingsSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <h4 className="font-semibold text-on-surface text-sm uppercase tracking-wider text-slate-500">Employment Details</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.job_title}
            onChange={(e) => onChange('job_title', e.target.value)}
            placeholder="e.g., Senior Instructor"
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.employment_type}
            onChange={(e) => onChange('employment_type', e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Monthly Salary (EGP)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={formData.monthly_salary}
            onChange={(e) => onChange('monthly_salary', parseInt(e.target.value, 10) || 0)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Contract %
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={formData.contract_percentage || ''}
            onChange={(e) => onChange('contract_percentage', e.target.value ? parseInt(e.target.value, 10) : undefined)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Active Status Toggle */}
      {mode === 'edit' && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => onStatusChange(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-secondary border-slate-200 rounded focus:ring-secondary cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-on-surface cursor-pointer select-none">
            Employee is active
          </label>
        </div>
      )}
    </div>
  )
}
