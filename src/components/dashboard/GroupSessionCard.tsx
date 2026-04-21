import type { Session } from '../../api/academics'
import { AttendanceGrid } from '../attendance/AttendanceGrid'

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
  return (
    <AttendanceGrid
      sessions={sessions}
      groupId={groupId}
      level={level}
      groupInstructorName={instructorName}
      groupName={groupName}
      courseName={courseName}
    />
  )
}
