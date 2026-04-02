import { useNavigate } from 'react-router-dom'
import type { Session, Group } from '../../api/academics'

interface GroupSessionCardProps {
  group: Group
  sessions: Session[]
  selectedDate: string
}

export function GroupSessionCard({ group, sessions, selectedDate }: GroupSessionCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/groups/${group.id}`)
  }

  const handleAttendanceClick = (sessionId: number) => {
    navigate(`/attendance?session=${sessionId}`)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 px-6 bg-surface-container-low border-b border-slate-200 cursor-pointer hover:bg-surface-container transition-colors" onClick={handleCardClick}>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-headline text-lg font-semibold text-on-surface">{group.name}</h3>
          <span className="text-xs text-secondary bg-secondary-container px-2 py-0.5 rounded font-medium">{group.course_name}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-on-surface-variant">
          <span>{group.instructor_name}</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">group</span>
            {group.student_count} students
          </span>
        </div>
      </div>

      <div className="p-2">
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No sessions scheduled for this day</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-3 px-4 rounded-md mb-1 transition-colors ${
                session.attendance_marked ? 'bg-secondary/5' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-on-surface">{session.start_time}</span>
                <span className="text-xs text-slate-500">{session.start_time} - {session.end_time}</span>
              </div>
              <div className="flex-1 text-center">
                {session.status === 'completed' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
                )}
                {session.status === 'cancelled' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>
                )}
                {session.status === 'scheduled' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>
                )}
              </div>
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md transition-all ${
                  session.attendance_marked
                    ? 'bg-secondary-container border-secondary text-secondary'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                } ${session.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleAttendanceClick(session.id)}
                disabled={session.status === 'cancelled'}
              >
                {session.attendance_marked ? (
                  <>
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    Marked
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">edit_note</span>
                    Attendance
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
