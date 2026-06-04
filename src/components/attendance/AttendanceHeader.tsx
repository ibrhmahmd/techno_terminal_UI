import { useMemo } from 'react'
import type { SessionWithAttendanceDTO } from '../../api/dashboard'
import { formatTime } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'

interface AttendanceHeaderProps {
  sessions: SessionWithAttendanceDTO[]
  groupInstructorName?: string  // Fallback from group level for consistency
}

export function AttendanceHeader({ sessions, groupInstructorName }: AttendanceHeaderProps) {
  const displaySessions = useMemo(() => sessions.slice(0, 5), [sessions])

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
          className="px-6 py-4 text-xs font-extrabold text-slate-800 uppercase tracking-[0.2em] border-b border-slate-300 border-r border-slate-200"
          style={{ width: 280 }}
        >
          Student
        </th>
        {displaySessions.map((session, sessionIdx) => {
          const cancelled = isCancelled(session)
          const sessionNum = session.session_number || (sessionIdx + 1)

          return (
            <th
              key={`session-header-${session.session_id}-${sessionIdx}`}
              className={`px-4 py-4 border-b border-slate-300 text-center border-l border-slate-200 bg-slate-100 ${
                cancelled ? 'opacity-50 blur-[1px] bg-gray-200' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1 min-w-[120px]">
                {/* Session Date */}
                <span className="block text-[13px] font-extrabold text-slate-900 leading-none">
                  {formatSessionDate(session.date)}
                </span>
                {/* Session Number */}
                <span className={`block text-[11px] font-bold uppercase tracking-wider text-slate-500 ${cancelled ? 'line-through text-slate-400' : ''}`}>
                  Session {sessionNum}
                </span>
                {/* Time */}
                <span className="block text-[11px] font-semibold text-slate-600 tracking-tight leading-none">
                  {session.time_start ? formatTime(session.time_start) : ''}
                </span>
                {/* Instructor name badge */}
                <span 
                  className="block text-[10px] font-bold text-slate-800 bg-slate-200/85 border border-slate-300/60 px-2 py-0.5 rounded-sm mt-0.5 max-w-full truncate"
                  title={getInstructorName(session)}
                >
                  {getInstructorName(session)}
                </span>
                {cancelled && (
                  <span className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${sessionStatusColors.cancelled}`}>
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
