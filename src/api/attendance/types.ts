export type AttendanceStatus = 'present' | 'absent' | 'not_taken'

export type AttendanceEntry = {
  student_id: string
  status: AttendanceStatus
}

export interface AttendanceRosterDTO {
  student_id: number
  student_name: string
  enrollment_id: number
  billing_status: 'paid' | 'due' | 'partial'
  balance: number
  joined_at: string
}

export interface AttendanceSessionDTO {
  session_id: number
  session_number: number
  date: string
  time_start: string
  time_end: string
  status: 'scheduled' | 'completed' | 'cancelled'
  is_extra_session: boolean
  notes: string | null
  attendance: Record<string, 'present' | 'absent' | 'excused' | 'late' | null>
}

export interface AttendanceLevelResponse {
  group_id: number
  level_number: number
  generated_at: string
  cache_ttl: number
  roster: AttendanceRosterDTO[]
  sessions: AttendanceSessionDTO[]
}


