import type { EmployeeListItem } from '../../api/hr/types'
import { employeeStatusColors } from '../../utils/colors'
import { CardSkeleton } from '../directory/shared/CardSkeleton'
import { RowActions } from '../common/RowActions'

interface EmployeeCardProps {
  employee: EmployeeListItem
  onView: () => void
  onEdit: () => void
  onCreateAccount: () => void
  isLoading?: boolean
}

export function EmployeeCard({ employee, onView, onEdit, onCreateAccount, isLoading }: EmployeeCardProps) {
  if (isLoading) {
    return <CardSkeleton />
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onView()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${employee.full_name} details`}
      onClick={onView}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col focus-visible:ring-2 focus-visible:ring-cyan-400/70"
    >
      {/* Header with avatar and name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-lg flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface truncate">{employee.full_name}</h3>
        </div>
      </div>

      {/* Job info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">work</span>
          <span className="text-sm">{employee.job_title}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">schedule</span>
          <span className="text-sm">
            {employmentTypeLabels[employee.employment_type] || employee.employment_type}
          </span>
        </div>
        {employee.phone && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">call</span>
            <span className="text-sm">{employee.phone}</span>
          </div>
        )}
        {employee.email && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">mail</span>
            <span className="text-sm truncate">{employee.email}</span>
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
      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={[
            { icon: 'visibility', label: 'View', onClick: () => onView(), variant: 'primary' },
            { icon: 'edit', label: 'Edit', onClick: () => onEdit() },
            { icon: 'person_add', label: 'Create Account', onClick: () => onCreateAccount() },
          ]}
        />
      </div>
    </div>
  )
}
