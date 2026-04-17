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

// UserEngagementDTO removed - endpoint not documented in API spec

export interface RetentionAnalysisDTO {
  cohort_month: string
  initial_enrollments: number
  retention_by_month: Record<string, string>
  retention_rates: {
    overall_retention_pct: number
  }
}
