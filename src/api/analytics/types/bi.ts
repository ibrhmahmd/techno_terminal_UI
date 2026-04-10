/**
 * Analytics API Types - BI Module
 * DTOs for business intelligence: trends, retention, performance metrics
 * @see docs/api/analytics/bi.md
 */

export interface EnrollmentTrendDTO {
  day: string
  new_enrollments: number
}

export interface InstructorPerformanceDTO {
  instructor_name: string
  active_groups: number
  active_students: number
}

export interface RetentionMetricsDTO {
  course_name: string
  active_count: number
  dropped_count: number
  total_enrollments: number
}

export interface LevelRetentionFunnelDTO {
  course_name: string
  level_number: number
  student_count: number
}

export interface InstructorValueMatrixDTO {
  instructor_name: string
  total_revenue: number
  avg_attendance_pct: number
}

export interface ScheduleUtilizationDTO {
  day: string
  time_start: string
  total_enrolled: number
  total_capacity: number
  utilization_pct: number
}

export interface FlightRiskStudentDTO {
  student_name: string
  course_name: string
  amount_owed: number
  sessions_missed: number
}

export interface UserEngagementDTO {
  date: string
  daily_active_users: number
  total_sessions: number
  avg_session_duration_minutes: number
  feature_usage: {
    attendance_marking: number
    student_search: number
    receipt_creation: number
  }
}

export interface RetentionAnalysisDTO {
  cohort_month: string
  initial_enrollments: number
  retained_1m: number
  retained_3m: number
  retained_6m: number
  retention_1m_pct: number
  retention_3m_pct: number
  retention_6m_pct: number
}
