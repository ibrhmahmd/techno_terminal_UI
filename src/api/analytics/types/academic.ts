/**
 * Analytics API Types - Academic Module
 * DTOs for academic metrics: enrollments, sessions, attendance, progress
 * @see docs/api/analytics/academic.md
 */

export interface DashboardSummaryPublic {
  active_enrollments: number
  today_sessions_count: number
  sessions: SessionInfo[]
}

export interface SessionInfo {
  session_id: number
  session_date: string
  start_time: string
  end_time: string
  session_number: number
  level_number: number
  group_id: number
  course_name: string
  group_name: string
  instructor_name: string
  present: number
  absent: number
  unmarked: number
  total_enrolled: number
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

export interface StudentProgressDTO {
  student_id: number
  student_name: string
  course_name: string
  group_name: string
  current_level: number
  total_sessions: number
  sessions_attended: number
  sessions_missed: number
  attendance_pct: number
  progress_status: 'on_track' | 'at_risk' | 'behind'
  estimated_completion_date: string
  enrollment_date: string
  last_attendance_date: string
}

export interface CourseCompletionDTO {
  course_id: number
  course_name: string
  started_count: number
  completed_count: number
  dropped_count: number
  in_progress_count: number
  completion_pct: number
  avg_days_to_complete: number
}
