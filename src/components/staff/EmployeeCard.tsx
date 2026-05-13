import type { EmployeeListItem } from '../../api/hr/types'
import { employeeStatusColors } from '../../utils/colors'
import { Skeleton } from '../common/Skeleton'

interface EmployeeCardProps {
  employee: EmployeeListItem
  onView: () => void
  onEdit: () => void
  onCreateAccount: () => void
  isLoading?: boolean
}

export function EmployeeCard({ employee, onView, onEdit, onCreateAccount, isLoading }: EmployeeCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-4 mb-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    )
  }

  const initials = employee.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const employmentTypeLabels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract'
  }

  const statusKey = employee.is_active ? 'active' : 'inactive'
  const statusClass = employeeStatusColors[statusKey] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
      {/* Header with avatar and name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-lg flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{employee.full_name}</h3>
        </div>
      </div>

      {/* Job info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-sm">work</span>
          <span className="text-sm text-slate-700">{employee.job_title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
          <span className="text-sm text-slate-500">
            {employmentTypeLabels[employee.employment_type] || employee.employment_type}
          </span>
        </div>
        {employee.phone && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-sm">call</span>
            <span className="text-sm text-slate-600">{employee.phone}</span>
          </div>
        )}
        {employee.email && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
            <span className="text-sm text-slate-600 truncate">{employee.email}</span>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${employee.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
          {employee.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          title="View Details"
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary bg-secondary-container/30 rounded-lg hover:bg-secondary-container/50 transition-colors"
          title="Edit"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
          Edit
        </button>
        <button
          onClick={onCreateAccount}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          title="Create Account"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Account
        </button>
      </div>
    </div>
  )
}
