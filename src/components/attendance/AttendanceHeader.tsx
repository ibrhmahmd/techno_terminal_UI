import { useMemo } from 'react'
import type { Session } from '../../api/academics'
import { formatTime } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'

interface AttendanceHeaderProps {
  sessions: Session[]
  groupInstructorName?: string  // Fallback from group level for consistency
}

export function AttendanceHeader({ sessions, groupInstructorName }: AttendanceHeaderProps) {
  const displaySessions = useMemo(() => sessions.slice(0, 5), [sessions])

  const isCancelled = (session: Session) => session.status === 'cancelled'

  // Helper to get instructor name with fallback
  const getInstructorName = (session: Session) => {
    // Prefer session-level instructor name if available
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
          className="px-6 py-4 text-[10px] font-extrabold text-slate-800 uppercase tracking-[0.2em] border-b border-slate-300 border-r border-slate-200"
          style={{ width: 280 }}
        >
          Student
        </th>
        {displaySessions.map((session, sessionIdx) => {
          const cancelled = isCancelled(session)

          return (
            <th
              key={`session-header-${session.id}-${sessionIdx}`}
              className={`px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-300 text-center border-l border-slate-200 bg-slate-100 ${
                cancelled ? 'opacity-50 blur-[1px] bg-gray-200' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={cancelled ? 'line-through text-slate-600' : 'font-bold text-slate-800'}>
                  Session {sessionIdx + 1}
                </span>
                <span className="block text-[9px] font-semibold tracking-normal text-slate-800">
                  {session.start_time ? formatTime(session.start_time) : ''}
                </span>
                {/* Instructor name */}
                <span className="block text-[9px] font-semibold text-slate-900 mt-0.5">
                  {getInstructorName(session)}
                </span>
                {cancelled && (
                  <span className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-bold ${sessionStatusColors.cancelled}`}>
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
