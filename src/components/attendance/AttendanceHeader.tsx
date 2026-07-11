import type { SessionWithAttendanceDTO } from '../../api/dashboard'
import { formatTime } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'

interface AttendanceHeaderProps {
  sessions: SessionWithAttendanceDTO[]
  groupInstructorName?: string  // Fallback from group level for consistency
}

export function AttendanceHeader({ sessions, groupInstructorName }: AttendanceHeaderProps) {


  const isCancelled = (session: SessionWithAttendanceDTO) => session.status === 'cancelled'

  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr || ''
    }
  }

  // Helper to get instructor name with fallback
  const getInstructorName = (session: SessionWithAttendanceDTO) => {
    // Prefer session-level instructor name if available (from new API)
    if (session.instructor_name && session.instructor_name.trim() !== '') {
      return session.instructor_name
    }
    // Fall back to group-level instructor name
    if (groupInstructorName && groupInstructorName.trim() !== '') {
      return groupInstructorName
    }
    return 'TBA'
  }

  return (
    <thead>
      <tr className="bg-slate-100">
        <th
          scope="col"
          className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-[0.2em] border-b border-slate-300 border-r border-slate-200"
          style={{ width: 280 }}
        >
          Student
        </th>
        {sessions.map((session, sessionIdx) => {
          const cancelled = isCancelled(session)
          const sessionNum = session.session_number || (sessionIdx + 1)

          return (
            <th
              key={`session-header-${session.session_id}-${sessionIdx}`}
              scope="col"
              className={`px-3 py-4 border-b border-slate-300 text-center border-l border-slate-200 bg-slate-100 ${
                cancelled ? 'opacity-50 blur-[1px] motion-reduce:blur-none bg-gray-200' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-2 min-w-[210px] justify-center">
                <div className="flex items-center gap-2 justify-center w-full">
                  {/* Left: Prominent Session Number Badge */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded bg-slate-900 text-white font-headline text-[17px] font-extrabold shadow-sm flex-shrink-0 ${
                    cancelled ? 'bg-slate-400 opacity-60' : ''
                  }`}>
                    {String(sessionNum).padStart(2, '0')}
                  </div>
                  {/* Right: Date and Time Stack */}
                  <div className="text-left flex flex-col justify-center">
                    <span className={`block text-[16px] font-extrabold text-slate-900 leading-tight tracking-tight ${
                      cancelled ? 'line-through text-slate-400' : ''
                    }`}>
                      {formatSessionDate(session.date)}
                    </span>
                    <span className="block text-[13px] font-bold text-slate-500 tracking-tight leading-none mt-0.5">
                      {session.time_start ? formatTime(session.time_start) : ''}
                    </span>
                  </div>
                </div>
                {/* Instructor name badge */}
                <span 
                  className="block text-[13px] font-extrabold text-slate-800 bg-slate-200/85 border border-slate-300/60 px-3 py-1.5 rounded mt-0.5 max-w-full truncate"
                  title={getInstructorName(session)}
                >
                  {getInstructorName(session)}
                </span>
                {cancelled && (
                  <span className={`mt-1 px-3 py-1 rounded-full text-[11px] font-bold ${sessionStatusColors.cancelled}`}>
                    CANCELLED
                  </span>
                )}
              </div>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
