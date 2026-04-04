export interface DashboardSummaryPublic {
  active_enrollments: number
  today_sessions_count: number
}

export interface SessionSummaryPublic {
  session_id: number
  group_id: number
  session_date: string
  start_time: string
  end_time: string
  instructor_name: string
}

export interface UnpaidAttendeeDTO {
  student_id: number
  student_name: string
  parent_name: string
  phone_primary: string
  total_balance: number
}

export interface GroupRosterRowDTO {
  student_id: number
  student_name: string
  enrollment_id: number
  enrollment_status: string
  balance: number
  sessions_attended: number
  sessions_missed: number
  total_sessions: number
  attendance_pct: number
}

export interface AttendanceHeatmapRowDTO {
  student_id: number
  student_name: string
  session_id: number
  session_number: number
  session_date: string
  status: string
}

// BI DTOs
export interface EnrollmentTrendDTO {
  day: string
  new_enrollments: number
}

export interface InstructorPerformanceDTO {
  instructor_name: string
  active_groups: number
  active_students: number
}
