import type { StudentListItem, StudentFilterItem, StudentStatus } from '../../api/crm'
import { calculateAge } from '../../api/crm/students/utils'
import { RowActions } from '../common/RowActions'
import { CardSkeleton } from './shared/CardSkeleton'
import { useNavigate } from 'react-router-dom'

type StudentCardData = StudentListItem | StudentFilterItem

interface StudentCardActions {
  onEdit?: () => void
  onDelete?: () => void
  onRestore?: () => void
  onPermanentDelete?: () => void
}

export interface StudentCardProps {
  student: StudentCardData
  actions: StudentCardActions
  isDeleted?: boolean
  loading?: boolean
}

const statusConfig: Record<StudentStatus, { label: string; bg: string; text: string; icon: string }> = {
  active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700', icon: 'check_circle' },
  waiting: { label: 'Waiting', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'schedule' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100', text: 'text-slate-600', icon: 'cancel' },
}

export function StudentCard({ student, actions, isDeleted = false, loading = false }: StudentCardProps) {
  const enrollment = 'current_group_name' in student ? student.current_group_name : null
  const navigate = useNavigate()
  if (loading) return <CardSkeleton />

  const age = 'date_of_birth' in student && student.date_of_birth
    ? calculateAge(student.date_of_birth)
    : 'age' in student
      ? student.age
      : null
  const status = statusConfig[student.status] ?? statusConfig.inactive

  return (
    <div
      onClick={() => navigate(`/students/${student.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/students/${student.id}`) } }}
      role="link"
      tabIndex={0}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface text-base truncate">
            {student.full_name}
          </h3>
          {student.phone && (
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">phone</span>
              {student.phone}
            </p>
          )}
          {!student.phone && (
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">phone</span>
              &mdash;
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.bg} ${status.text}`}>
          <span aria-hidden="true" className="material-symbols-outlined text-sm">{status.icon}</span>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
        {age !== null && (
          <span className="flex items-center gap-1">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">cake</span>
            {age} years
          </span>
        )}
        {enrollment && (
          <span className="flex items-center gap-1 truncate max-w-[180px]" title={enrollment}>
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">school</span>
            {enrollment}
          </span>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        {isDeleted ? (
          <RowActions
            visible="always"
            actions={[
              { icon: 'visibility', label: 'View', onClick: () => navigate(`/students/${student.id}`), variant: 'primary' },
              { icon: 'restore_from_trash', label: 'Restore', onClick: () => actions.onRestore?.() },
              { icon: 'delete_forever', label: 'Permanently Delete', onClick: () => actions.onPermanentDelete?.(), variant: 'danger' },
            ]}
          />
        ) : (
          <RowActions
            visible="always"
            actions={[
              { icon: 'visibility', label: 'View', onClick: () => navigate(`/students/${student.id}`), variant: 'primary' },
              ...(actions.onEdit ? [{ icon: 'edit' as const, label: 'Edit' as const, onClick: () => actions.onEdit!() }] : []),
              ...(actions.onDelete ? [{ icon: 'delete' as const, label: 'Delete' as const, onClick: () => actions.onDelete!(), variant: 'danger' as const }] : []),
            ]}
          />
        )}
      </div>
    </div>
  )
}
