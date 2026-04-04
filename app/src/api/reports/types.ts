export interface EnrollmentTrend {
  month: string
  new_enrollments: number
  transfers: number
  drops: number
  net_change: number
}

export interface RevenueMetrics {
  monthly_revenue: { month: string; amount: number }[]
  total_collected: number
  total_outstanding: number
  collection_rate: number
  average_monthly: number
}

export interface InstructorPerformanceReport {
  instructor_id: string
  instructor_name: string
  groups_count: number
  total_students: number
  attendance_rate: number
  sessions_conducted: number
  sessions_cancelled: number
}

export interface AttendanceSummary {
  date: string
  total_sessions: number
  attendance_marked: number
  attendance_rate: number
  students_present: number
  students_absent: number
}

export interface StudentProgressReport {
  student_id: string
  student_name: string
  current_level: number
  modules_completed: number
  total_modules: number
  progress_percentage: number
  average_score: number
  next_assessment_date?: string
}

export interface CoursePerformance {
  course_name: string
  total_groups: number
  total_students: number
  completion_rate: number
  average_score: number
  revenue_generated: number
}

export interface GroupAttendanceDetail {
  group_id: string
  group_name: string
  instructor_name: string
  student_count: number
  attendance_by_session: {
    session_id: string
    date: string
    attendance_count: number
    attendance_percentage: number
  }[]
  average_attendance_rate: number
}
