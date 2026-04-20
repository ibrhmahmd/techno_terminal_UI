// Student History Operations
// Endpoints: status history
// @see docs/api/crm/student_history.md

import client from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse } from '../../../types/api'
import type { StatusHistoryEntry, StatusHistoryRecord, AttendanceHistoryRecord } from './types/history'

/**
 * Get student status change history
 * @see docs/api/crm/student_history.md#get-status-history
 */
export async function getStatusHistory(
  studentId: number,
  params: PaginationParams = {}
): Promise<PaginationResult<StatusHistoryEntry>> {
  const { skip = 0, limit = 50 } = params
  const response = await client.get<PaginatedApiResponse<StatusHistoryEntry>>(
    `/crm/students/${studentId}/status-history`,
    { params: { skip, limit } }
  )

  const items = response.data.data || []
  const total = response.data.total || 0

  return {
    items,
    total,
    hasMore: total > skip + items.length
  }
}

/**
 * @deprecated This endpoint is not documented in the official API specification.
 * Do not use in new code. Will be removed in v2.0.
 * @see docs/api/crm/student_history.md
 */
export async function getAttendanceHistory(
  studentId: number,
  params: PaginationParams & { group_id?: number; from_date?: string; to_date?: string } = {}
): Promise<PaginationResult<AttendanceHistoryRecord>> {
  const { skip = 0, limit = 50, group_id, from_date, to_date } = params
  const response = await client.get<PaginatedApiResponse<AttendanceHistoryRecord>>(
    `/crm/students/${studentId}/attendance-history`,
    { params: { skip, limit, group_id, from_date, to_date } }
  )

  const items = response.data.data || []
  const total = response.data.total || 0

  return {
    items,
    total,
    hasMore: total > skip + items.length
  }
}

// Re-export types for backward compatibility
export type { StatusHistoryEntry, StatusHistoryRecord, AttendanceHistoryRecord }
