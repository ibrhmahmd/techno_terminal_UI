// Student Activity History Operations
// Endpoints: activity tracking, history, search, enrollment, competition
// @see docs/api/crm/student_history.md

import { client } from '../../client'
import type { ApiResponse } from '../../../types/api'
import type {
  ActivityLogResponseDTO,
  ActivitySummaryItem,
  EnrollmentHistoryEntry,
  CompetitionHistoryEntry,
  ActivityLogRequest,
  ManualActivityResponseDTO,
} from './types/activity'

// Get student activity history
export async function getStudentActivityHistory(
  studentId: number,
  params?: {
    activity_types?: string
    date_from?: string
    date_to?: string
    limit?: number
  }
): Promise<ActivityLogResponseDTO[]> {
  const response = await client.get<ApiResponse<ActivityLogResponseDTO[]>>(
    `/crm/students/${studentId}/history`,
    { params }
  )
  return response.data.data || []
}

// Get activity summary
export async function getActivitySummary(
  studentId: number,
  params?: { date_from?: string; date_to?: string }
): Promise<ActivitySummaryItem[]> {
  const response = await client.get<ApiResponse<ActivitySummaryItem[]>>(
    `/crm/students/${studentId}/activity-summary`,
    { params }
  )
  return response.data.data || []
}

// Get enrollment history with pagination
export interface PaginatedEnrollmentHistory {
  data: EnrollmentHistoryEntry[]
  total: number
  skip: number
  limit: number
}

export async function getEnrollmentHistory(
  studentId: number,
  params: { skip?: number; limit?: number } = {}
): Promise<PaginatedEnrollmentHistory> {
  const { skip = 0, limit = 50 } = params
  const response = await client.get<PaginatedEnrollmentHistory>(
    `/crm/students/${studentId}/enrollment-history`,
    { params: { skip, limit } }
  )
  return response.data
}

// Get competition participation history with pagination
export interface PaginatedCompetitionHistory {
  data: CompetitionHistoryEntry[]
  total: number
  skip: number
  limit: number
}

export async function getCompetitionHistory(
  studentId: number,
  params: { skip?: number; limit?: number } = {}
): Promise<PaginatedCompetitionHistory> {
  const { skip = 0, limit = 50 } = params
  const response = await client.get<PaginatedCompetitionHistory>(
    `/crm/students/${studentId}/competition-history`,
    { params: { skip, limit } }
  )
  return response.data
}

// Log manual activity
export async function logActivity(
  studentId: number,
  data: ActivityLogRequest
): Promise<ManualActivityResponseDTO> {
  const response = await client.post<ApiResponse<ManualActivityResponseDTO>>(
    `/crm/students/${studentId}/log-activity`,
    data
  )
  return response.data.data
}


