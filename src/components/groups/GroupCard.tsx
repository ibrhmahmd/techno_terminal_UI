import type { EnrichedGroupPublic } from '../../api/academics'
import { RowActions } from '../common/RowActions'
import { CardSkeleton } from '../directory/shared/CardSkeleton'
import { GroupStatusBadge } from './shared/GroupStatusBadge'

interface GroupCardActions {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export interface GroupCardProps {
  group: EnrichedGroupPublic
  actions: GroupCardActions
  loading?: boolean
}

function formatTime(t?: string): string {
  if (!t) return ''
  return t.slice(0, 5)
}

export function GroupCard({ group, actions, loading = false }: GroupCardProps) {
  if (loading) return <CardSkeleton />

  const schedule = [
    group.default_day,
    formatTime(group.default_time_start),
    formatTime(group.default_time_end),
  ].filter(Boolean).join(' ')

  const hasTime = group.default_time_start && group.default_time_end
  const timeRange = hasTime
    ? `${formatTime(group.default_time_start)} - ${formatTime(group.default_time_end)}`
    : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface text-base truncate">
            {group.group_name}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            {group.course_name}
          </p>
        </div>
        <GroupStatusBadge status={group.status} size="sm" />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">person</span>
          {group.instructor_name || 'Unassigned'}
        </span>
        {schedule && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {timeRange ? `${group.default_day} ${timeRange}` : group.default_day}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {group.current_student_count} / {group.max_capacity}
        </span>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={[
            ...(actions.onView ? [{ icon: 'visibility' as const, label: 'View' as const, onClick: () => actions.onView!(), variant: 'primary' as const }] : []),
            ...(actions.onEdit ? [{ icon: 'edit' as const, label: 'Edit' as const, onClick: () => actions.onEdit!() }] : []),
            ...(actions.onDelete ? [{ icon: 'delete' as const, label: 'Delete' as const, onClick: () => actions.onDelete!(), variant: 'danger' as const }] : []),
          ]}
        />
      </div>
    </div>
  )
}
