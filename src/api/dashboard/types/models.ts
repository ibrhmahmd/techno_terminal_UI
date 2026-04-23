/**
 * Dashboard API Types
 * Aligned with API documentation: docs/api/dashboard-api.md
 * 
 * @module dashboard/types
 * @see docs/api/dashboard-api.md
 */

// Lookup table types
export interface GroupInfoDTO {
  id: number
  name: string
  course_name: string
  instructor_id: number | null
  current_level: number
  default_day: string | null
  default_time_start: string | null
  default_time_end: string | null
  schedule_display: string
  max_capacity: number
  student_count: number
}

export interface InstructorInfoDTO {
  id: number
  name: string
}

// Session types
export interface TodaySessionDTO {
  session_id: number
  date: string
  time_start: string
  time_end: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface AttendanceRecordDTO {
  student_id: number
  student_name: string
  gender: 'male' | 'female'
  status: 'present' | 'absent' | 'cancelled' | null
}

export interface StudentRosterDTO {
  student_id: number
  student_name: string
  gender: 'male' | 'female'
  billing_status: 'paid' | 'due'
  balance: number
}

export interface SessionWithAttendanceDTO {
  // Primary identifier (compatible with existing Session type)
  session_id: number
  id: number  // Alias for session_id (backward compatibility)
  
  session_number: number
  
  // Date fields (compatible with existing Session type)
  date: string
  session_date: string  // Alias for date (backward compatibility)
  
  // Time fields (compatible with existing Session type)
  time_start: string
  start_time: string  // Alias for time_start (backward compatibility)
  time_end: string
  end_time: string  // Alias for time_end (backward compatibility)
  
  status: 'scheduled' | 'completed' | 'cancelled'
  is_extra_session: boolean
  
  // Group context
  group_id: number
  level_number: number
  
  // Instructor info
  actual_instructor_id: number | null
  instructor_name: string | null
  is_substitute: boolean
  
  // Optional notes (for compatibility)
  notes: string | null
  
  // Attendance data (new in this API)
  attendance: AttendanceRecordDTO[] | null
}

export interface CurrentLevelDTO {
  level_number: number
  sessions: SessionWithAttendanceDTO[]
}

export interface ScheduledGroupDTO {
  group_id: number
  today_session: TodaySessionDTO | null
  current_level: CurrentLevelDTO
  roster: StudentRosterDTO[]
}

export interface DashboardSummaryDTO {
  total_groups_today: number
  total_instructors_today: number
  unique_instructor_ids: number[]
}

// Main response
export interface DashboardDailyOverviewDTO {
  date: string
  generated_at: string
  cache_ttl: number
  groups: Record<number, GroupInfoDTO>
  instructors: Record<number, InstructorInfoDTO>
  scheduled_groups: ScheduledGroupDTO[]
  summary: DashboardSummaryDTO
}
