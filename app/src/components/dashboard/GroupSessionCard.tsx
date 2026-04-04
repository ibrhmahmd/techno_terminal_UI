import { useNavigate } from 'react-router-dom'
import type { Session } from '../../api/academics'
import { AttendanceGrid } from '../attendance/AttendanceGrid'
import { formatTime, getInitials } from '../../utils/formatting'

interface GroupSessionCardProps {
  groupName: string
  courseName: string
  instructorName: string
  sessions: Session[]
  groupId: number
  level: number
}

export function GroupSessionCard({ 
  groupName, 
  courseName, 
  instructorName, 
  sessions, 
  groupId, 
  level 
}: GroupSessionCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/groups/${groupId}`)
  }

  // Get time from first session or use default - formatted as local time
  const sessionTime = sessions.length > 0 
    ? `${formatTime(sessions[0].start_time)} - ${formatTime(sessions[0].end_time) || 'Next Hour'}`
    : '03:00 PM - 04:30 PM'

  // Get instructor initials safely
  const currentInstructorName = instructorName || 'TBA'
  const instructorInitials = getInitials(currentInstructorName, '?')

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
      {/* Header - Matches dashboard.html exactly */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-secondary rounded-full"></div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface leading-tight">{groupName}</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{courseName}</p>
            </div>
            <button
              onClick={handleCardClick}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>
          </div>
          <div className="ml-2 border-l border-slate-100 pl-4">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {sessionTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Instructor 
            </p>
            <p className="font-medium text-sm text-on-surface">{currentInstructorName}</p>
          </div>
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
            {instructorInitials}
          </div>
        </div>
      </div>

      <AttendanceGrid sessions={sessions} groupId={groupId} level={level} groupInstructorName={instructorName} />
    </div>
  )
}
