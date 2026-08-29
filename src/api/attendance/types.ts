export type AttendanceStatus = 'present' | 'absent' | 'not_taken'

export type AttendanceEntry = {
  student_id: string
  status: AttendanceStatus
}

// Attendance DTOs are the source of truth in api/academics — re-export to keep
// a single definition for roster/session/level-response models.
export type {
  AttendanceRosterDTO,
  AttendanceSessionDTO,
  AttendanceLevelResponse,
} from '../academics'
