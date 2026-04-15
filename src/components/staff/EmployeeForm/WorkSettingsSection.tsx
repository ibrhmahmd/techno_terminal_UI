import type { Employee } from '../../../api/hr'

interface WorkSettingsSectionProps {
  formData: {
    job_title: string
    employment_type: string
    salary: number
    status: string
    notes: string
  }
  onChange: (field: string, value: any) => void
  onStatusChange: (status: Employee['status']) => void
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
            Salary (EGP) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={formData.salary}
            onChange={(e) => onChange('salary', parseInt(e.target.value, 10) || 0)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        {mode === 'edit' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface">Status</label>
            <select
              value={formData.status}
              onChange={(e) => onStatusChange(e.target.value as Employee['status'])}
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
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Enter any work related notes..."
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>
    </div>
  )
}
