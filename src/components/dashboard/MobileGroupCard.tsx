import type { GroupInfoDTO } from '../../api/dashboard'
import { formatInstructorName, formatTime } from '../../utils/formatting'

export interface MobileGroupCardProps {
  group: GroupInfoDTO
  instructorName: string
  onOpenAttendance: () => void
}

export function MobileGroupCard({ group, instructorName, onOpenAttendance }: MobileGroupCardProps) {
  const shortInstructor = formatInstructorName(instructorName)
  const scheduleDay = group.default_day
  const timeRange = group.default_time_start && group.default_time_end
    ? `${formatTime(group.default_time_start)} – ${formatTime(group.default_time_end)}`
    : null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpenAttendance()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View attendance for ${group.name}`}
      onClick={onOpenAttendance}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col"
    >
      {/* Header */}
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
        {/* Attendance indicator badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100 shrink-0 ml-2">
          <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
          Attendance
        </span>
      </div>

      {/* Meta info row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
        <span className="flex items-center gap-1" title={instructorName}>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">person</span>
          {shortInstructor}
        </span>
        {(scheduleDay || timeRange) && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
            {scheduleDay}{timeRange ? ` ${timeRange}` : ''}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">group</span>
          {group.student_count} / {group.max_capacity}
        </span>
      </div>

      {/* Footer action */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenAttendance() }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-sm font-semibold hover:bg-secondary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
          Mark Attendance
        </button>
      </div>
    </div>
  )
}
