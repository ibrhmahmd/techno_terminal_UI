import type { EmployeeListItem } from '../../api/hr/types'
import { CardSkeleton } from '../directory/shared/CardSkeleton'
import { RowActions } from '../common/RowActions'

interface EmployeeCardProps {
  employee: EmployeeListItem
  onView: () => void
  onEdit: () => void
  onCreateAccount: () => void
  onDelete?: () => void
  onRestore?: () => void
  isLoading?: boolean
}

export function EmployeeCard({ employee, onView, onEdit, onCreateAccount, onDelete, onRestore, isLoading }: EmployeeCardProps) {
  if (isLoading) {
    return <CardSkeleton />
  }

  const isDeleted = !!employee.deleted_at

  const employmentTypeLabels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract'
  }

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
      className={`rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
        isDeleted
          ? 'border-red-200 bg-red-50 opacity-75 hover:border-red-300'
          : 'border-slate-200 bg-white hover:border-secondary/30'
      }`}
    >
      {/* Header with name, ID, and status */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-headline font-semibold text-on-surface truncate">{employee.full_name}</h3>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-xs text-slate-400 font-mono">#{employee.id}</span>
          <span className={`flex items-center gap-1 ${employee.is_active ? 'text-green-600' : 'text-slate-400'}`}>
            <span className={`w-2 h-2 rounded-full ${employee.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium">{employee.is_active ? 'Active' : 'Inactive'}</span>
              </span>
              {isDeleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Deleted
                </span>
              )}
        </div>
      </div>

      {/* Deleted timestamp */}
      {isDeleted && employee.deleted_at && (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">event_busy</span>
          <span className="text-xs">Deleted {new Date(employee.deleted_at).toLocaleDateString()}</span>
        </div>
      )}

      {/* Job info — compact two-column row */}
      <div className="flex items-center gap-4 text-on-surface-variant flex-wrap mb-4">
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">work</span>
          <span className="text-sm">{employee.job_title}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">schedule</span>
          <span className="text-sm">
            {employmentTypeLabels[employee.employment_type] || employee.employment_type}
          </span>
        </span>
      </div>

      {/* Additional info */}
      <div className="space-y-2 mb-4">
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

      {/* Action buttons */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={
            isDeleted
              ? [
                  { icon: 'visibility', label: 'View', onClick: () => onView(), variant: 'primary' },
                  { icon: 'restore', label: 'Restore', onClick: () => onRestore?.(), variant: 'primary' },
                ]
              : [
                  { icon: 'visibility', label: 'View', onClick: () => onView(), variant: 'primary' },
                  { icon: 'edit', label: 'Edit', onClick: () => onEdit() },
                  { icon: 'person_add', label: 'Create Account', onClick: () => onCreateAccount() },
                  { icon: 'delete', label: 'Delete', onClick: () => onDelete?.(), variant: 'danger' },
                ]
          }
        />
      </div>
    </div>
  )
}
