import type { TodaySessionDTO } from '../../api/dashboard'

export interface MobileGroupCardProps {
  groupId: number
  groupName: string
  courseName: string
  instructorName: string
  sessionCount: number
  studentCount: number
  todaySession: TodaySessionDTO | null
  onOpenAttendance: () => void
}

export function MobileGroupCard({
  groupName,
  courseName,
  instructorName,
  sessionCount,
  studentCount,
  onOpenAttendance,
}: MobileGroupCardProps) {
  return (
    <button
      onClick={onOpenAttendance}
      className="w-full relative min-h-[80px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-4 pl-5 text-left transition-all active:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent group"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-xl opacity-80" />

      <div className="flex justify-between items-start w-full">
        <div className="flex-1 pr-4">
          <h3 className="font-headline font-bold text-slate-900 text-lg leading-tight mb-0.5">
            {groupName}
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-2">{courseName}</p>
          
          <div className="flex items-center gap-1.5 text-slate-600 mb-3">
            <span className="material-symbols-outlined text-sm opacity-70">person</span>
            <span className="text-sm font-medium">{instructorName}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">event</span>
              <span>{sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">group</span>
              <span>{studentCount} {studentCount === 1 ? 'Student' : 'Students'}</span>
            </div>
          </div>
        </div>

        {/* Right arrow */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 transition-colors">
          <span className="material-symbols-outlined text-teal-500 text-xl">arrow_forward</span>
        </div>
      </div>
    </button>
  )
}
