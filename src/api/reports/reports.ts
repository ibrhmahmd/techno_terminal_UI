/**
 * @deprecated This module is deprecated. Use api/analytics instead.
 * All endpoints have been migrated to the new analytics API with standardized contracts.
 * @see src/api/analytics/index.ts
 */

import client from '../client'
import type {
  EnrollmentTrend, RevenueMetrics, InstructorPerformanceReport,
  AttendanceSummary, StudentProgressReport, CoursePerformance,
  GroupAttendanceDetail
} from './types'

/**
 * @deprecated Use getEnrollmentTrends from api/analytics instead
 * The new endpoint uses cutoff date parameter instead of months
 * @see src/api/analytics/bi.ts
 */
export async function getEnrollmentTrends(months: number = 12): Promise<EnrollmentTrend[]> {
  const response = await client.get<{ data: EnrollmentTrend[] }>('/reports/enrollment-trends', {
    params: { months }
  })
  return response.data.data || []
}

/**
 * @deprecated Use getRevenueMetrics from api/analytics instead
 * The new endpoint doesn't take months parameter - use getRevenueByDate for date ranges
 * @see src/api/analytics/financial.ts
 */
export async function getRevenueMetrics(months: number = 12): Promise<RevenueMetrics> {
  const response = await client.get<{ data: RevenueMetrics }>('/reports/revenue-metrics', {
    params: { months }
  })
  return response.data.data
}

/**
 * @deprecated Use getInstructorPerformance from api/analytics instead
 * @see src/api/analytics/bi.ts
 */
export async function getInstructorPerformance(): Promise<InstructorPerformanceReport[]> {
  const response = await client.get<{ data: InstructorPerformanceReport[] }>('/reports/instructor-performance')
  return response.data.data || []
}

/**
 * @deprecated Use getAttendanceHeatmap from api/analytics instead
 * @see src/api/analytics/academic.ts
 */
export async function getAttendanceSummary(startDate?: string, endDate?: string): Promise<AttendanceSummary[]> {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  
  const response = await client.get<{ data: AttendanceSummary[] }>('/reports/attendance-summary', {
    params: Object.keys(params).length > 0 ? params : undefined
  })
  return response.data.data || []
}

/**
 * @deprecated Use getStudentProgress from api/analytics instead
 * @see src/api/analytics/academic.ts
 */
export async function getStudentProgressReport(): Promise<StudentProgressReport[]> {
  const response = await client.get<{ data: StudentProgressReport[] }>('/reports/student-progress')
  return response.data.data || []
}

/**
 * @deprecated Use getCourseCompletion from api/analytics instead
 * @see src/api/analytics/academic.ts
 */
export async function getCoursePerformance(): Promise<CoursePerformance[]> {
  const response = await client.get<{ data: CoursePerformance[] }>('/reports/course-performance')
  return response.data.data || []
}

/**
 * @deprecated Use getAttendanceHeatmap from api/analytics instead
 * @see src/api/analytics/academic.ts
 */
export async function getGroupAttendanceDetail(groupId: string): Promise<GroupAttendanceDetail> {
  const response = await client.get<{ data: GroupAttendanceDetail }>(`/reports/groups/${groupId}/attendance`)
  return response.data.data
}
