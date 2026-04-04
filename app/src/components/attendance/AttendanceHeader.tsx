import { useMemo } from 'react'
import type { Session } from '../../api/academics'
import { formatTime } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'

interface AttendanceHeaderProps {
  sessions: Session[]
}

export function AttendanceHeader({ sessions }: AttendanceHeaderProps) {
  const displaySessions = useMemo(() => sessions.slice(0, 5), [sessions])

  const isCancelled = (session: Session) => session.status === 'cancelled'

  return (
    <thead>
      <tr className="bg-surface-container-lowest">
        <th
          className="px-6 py-5 text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em] border-b border-outline-variant/10"
          style={{ width: 280 }}
        >
          Student
        </th>
        {displaySessions.map((session, sessionIdx) => {
          const cancelled = isCancelled(session)

          return (
            <th
              key={`session-header-${session.id}-${sessionIdx}`}
              className={`px-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-outline-variant/10 text-center border-l border-outline-variant/5 text-outline-variant ${
                cancelled ? 'opacity-50 blur-[1px] bg-gray-100' : ''
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={cancelled ? 'line-through' : ''}>
                  Session {sessionIdx + 1}
                </span>
                <span className="block text-[8px] font-normal tracking-normal opacity-60">
                  {session.start_time ? formatTime(session.start_time) : ''}
                </span>
                {/* Instructor name */}
                <span className="block text-[9px] font-normal text-slate-500 mt-0.5">
                  Instructor: {session.instructor_name || 'TBA'}
                </span>
                {cancelled && (
                  <span className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-medium ${sessionStatusColors.cancelled}`}>
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
