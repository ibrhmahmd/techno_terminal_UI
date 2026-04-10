/**
 * Analytics API - BI Module
 * Business intelligence endpoints: trends, retention, performance, risk analysis
 * 
 * @module analytics/bi
 * @see docs/api/analytics/bi.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  EnrollmentTrendDTO,
  InstructorPerformanceDTO,
  RetentionMetricsDTO,
  LevelRetentionFunnelDTO,
  InstructorValueMatrixDTO,
  ScheduleUtilizationDTO,
  FlightRiskStudentDTO,
  UserEngagementDTO,
  RetentionAnalysisDTO,
} from './types'

/**
 * Get enrollment trends over time
 * @param cutoff - Optional start date for trend analysis (YYYY-MM-DD), defaults to 90 days ago
 * @see docs/api/analytics/bi.md#get-enrollment-trend
 */
export async function getEnrollmentTrends(cutoff?: string): Promise<EnrollmentTrendDTO[]> {
  const params = cutoff ? { params: { cutoff } } : {}
  const response = await client.get<ApiResponse<EnrollmentTrendDTO[]>>('/analytics/bi/enrollment-trend', params)
  return response.data.data || []
}

/**
 * Get instructor performance metrics (groups and active students per instructor)
 * @see docs/api/analytics/bi.md#get-instructor-performance
 */
export async function getInstructorPerformance(): Promise<InstructorPerformanceDTO[]> {
  const response = await client.get<ApiResponse<InstructorPerformanceDTO[]>>('/analytics/bi/instructor-performance')
  return response.data.data || []
}

/**
 * Get retention metrics per course (active vs dropped enrollments)
 * @see docs/api/analytics/bi.md#get-retention-metrics
 */
export async function getRetentionMetrics(): Promise<RetentionMetricsDTO[]> {
  const response = await client.get<ApiResponse<RetentionMetricsDTO[]>>('/analytics/bi/retention')
  return response.data.data || []
}

/**
 * Get level retention funnel (student counts per course/level)
 * @see docs/api/analytics/bi.md#get-level-retention-funnel
 */
export async function getRetentionFunnel(): Promise<LevelRetentionFunnelDTO[]> {
  const response = await client.get<ApiResponse<LevelRetentionFunnelDTO[]>>('/analytics/bi/retention-funnel')
  return response.data.data || []
}

/**
 * Get instructor value matrix (revenue and attendance correlation)
 * @see docs/api/analytics/bi.md#get-instructor-value-matrix
 */
export async function getInstructorValueMatrix(): Promise<InstructorValueMatrixDTO[]> {
  const response = await client.get<ApiResponse<InstructorValueMatrixDTO[]>>('/analytics/bi/instructor-value')
  return response.data.data || []
}

/**
 * Get schedule utilization percentages
 * @see docs/api/analytics/bi.md#get-schedule-utilization
 */
export async function getScheduleUtilization(): Promise<ScheduleUtilizationDTO[]> {
  const response = await client.get<ApiResponse<ScheduleUtilizationDTO[]>>('/analytics/bi/schedule-utilization')
  return response.data.data || []
}

/**
 * Get flight-risk students (likely to drop out)
 * @see docs/api/analytics/bi.md#get-flight-risk-students
 */
export async function getFlightRiskStudents(): Promise<FlightRiskStudentDTO[]> {
  const response = await client.get<ApiResponse<FlightRiskStudentDTO[]>>('/analytics/bi/flight-risk')
  return response.data.data || []
}

/**
 * Get user engagement metrics
 * @param days - Number of days to analyze (1-90), defaults to 30
 * @see docs/api/analytics/bi.md#get-user-engagement
 */
export async function getUserEngagement(days?: number): Promise<UserEngagementDTO[]> {
  const params = days ? { params: { days } } : {}
  const response = await client.get<ApiResponse<UserEngagementDTO[]>>('/analytics/bi/user-engagement', params)
  return response.data.data || []
}

/**
 * Get retention analysis by cohort
 * @see docs/api/analytics/bi.md#get-retention-analysis
 */
export async function getRetentionAnalysis(): Promise<RetentionAnalysisDTO[]> {
  const response = await client.get<ApiResponse<RetentionAnalysisDTO[]>>('/analytics/bi/retention-analysis')
  return response.data.data || []
}
