import type { EnrichedGroupPublic } from '../../api/academics'
import { RowActions } from '../common/RowActions'
import { CardSkeleton } from '../directory/shared/CardSkeleton'
import { GroupStatusBadge } from './shared/GroupStatusBadge'
import { formatTimeDisplay } from '../../utils/formatting'

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

export function GroupCard({ group, actions, loading = false }: GroupCardProps) {
  if (loading) return <CardSkeleton />

  const day = group.schedule?.day
  const startTime = group.schedule?.start_time
  const endTime = group.schedule?.end_time

  const schedule = [
    day,
    formatTimeDisplay(startTime),
    formatTimeDisplay(endTime),
  ].filter((s) => s !== '--:--' && Boolean(s)).join(' ')

  const hasTime = startTime && endTime
  const timeRange = hasTime
    ? `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
    : null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && actions.onView) {
      e.preventDefault()
      actions.onView()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={actions.onView}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface text-base truncate">
            {group.name}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">menu_book</span>
            {group.course_name}
          </p>
        </div>
        <GroupStatusBadge status={group.status} size="sm" />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">person</span>
          {group.instructor_name || 'Unassigned'}
        </span>
        {schedule && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
            {timeRange ? `${day} ${timeRange}` : day}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">group</span>
          {group.current_student_count ?? 0} / {group.capacity}
        </span>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={[
            ...(actions.onView ? [{ icon: 'visibility' as const, label: 'View', onClick: () => actions.onView!(), variant: 'primary' as const }] : []),
            ...(actions.onEdit ? [{ icon: 'edit' as const, label: 'Edit', onClick: () => actions.onEdit!() }] : []),
            ...(actions.onDelete ? [{ icon: 'delete' as const, label: 'Delete', onClick: () => actions.onDelete!(), variant: 'danger' as const }] : []),
          ]}
        />
      </div>
    </div>
  )
}
