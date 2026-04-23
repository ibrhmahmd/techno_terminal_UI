import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'
import { AttendanceGrid } from '../attendance/AttendanceGrid'

interface GroupSessionCardProps {
  groupName: string
  courseName: string
  instructorName: string
  sessions: SessionWithAttendanceDTO[]
  roster: StudentRosterDTO[]
  groupId: number
  level: number
}

export function GroupSessionCard({
  groupName,
  courseName,
  instructorName,
  sessions,
  roster,
  groupId,
  level
}: GroupSessionCardProps) {
  return (
    <AttendanceGrid
      sessions={sessions}
      roster={roster}
      groupId={groupId}
      level={level}
      groupInstructorName={instructorName}
      groupName={groupName}
      courseName={courseName}
    />
  )
}
