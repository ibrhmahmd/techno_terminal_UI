import client from './client'

// Enrollment Trends
export interface EnrollmentTrend {
  month: string
  new_enrollments: number
  transfers: number
  drops: number
  net_change: number
}

export async function getEnrollmentTrends(months: number = 12): Promise<EnrollmentTrend[]> {
  const response = await client.get<{ data: EnrollmentTrend[] }>('/reports/enrollment-trends', {
    params: { months }
  })
  return response.data.data || []
}

// Revenue Metrics
export interface RevenueMetrics {
  monthly_revenue: { month: string; amount: number }[]
  total_collected: number
  total_outstanding: number
  collection_rate: number
  average_monthly: number
}

export async function getRevenueMetrics(months: number = 12): Promise<RevenueMetrics> {
  const response = await client.get<{ data: RevenueMetrics }>('/reports/revenue-metrics', {
    params: { months }
  })
  return response.data.data
}

// Instructor Performance
export interface InstructorPerformance {
  instructor_id: string
  instructor_name: string
  groups_count: number
  total_students: number
  attendance_rate: number
  sessions_conducted: number
  sessions_cancelled: number
}

export async function getInstructorPerformance(): Promise<InstructorPerformance[]> {
  const response = await client.get<{ data: InstructorPerformance[] }>('/reports/instructor-performance')
  return response.data.data || []
}

// Attendance Summary
export interface AttendanceSummary {
  date: string
  total_sessions: number
  attendance_marked: number
  attendance_rate: number
  students_present: number
  students_absent: number
}

export async function getAttendanceSummary(startDate?: string, endDate?: string): Promise<AttendanceSummary[]> {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  
  const response = await client.get<{ data: AttendanceSummary[] }>('/reports/attendance-summary', {
    params: Object.keys(params).length > 0 ? params : undefined
  })
  return response.data.data || []
}

// Student Progress Report
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

export async function getStudentProgressReport(): Promise<StudentProgressReport[]> {
  const response = await client.get<{ data: StudentProgressReport[] }>('/reports/student-progress')
  return response.data.data || []
}

// Course Performance
export interface CoursePerformance {
  course_name: string
  total_groups: number
  total_students: number
  completion_rate: number
  average_score: number
  revenue_generated: number
}

export async function getCoursePerformance(): Promise<CoursePerformance[]> {
  const response = await client.get<{ data: CoursePerformance[] }>('/reports/course-performance')
  return response.data.data || []
}

// Group Attendance Detail
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

export async function getGroupAttendanceDetail(groupId: string): Promise<GroupAttendanceDetail> {
  const response = await client.get<{ data: GroupAttendanceDetail }>(`/reports/groups/${groupId}/attendance`)
  return response.data.data
}
