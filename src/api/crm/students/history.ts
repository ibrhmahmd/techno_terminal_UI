// Student History Operations
// Endpoints: status history, attendance history

import client from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse } from '../../../types/api'
import type { StatusHistoryRecord, AttendanceHistoryRecord } from './types/history'

// Get Status History
export async function getStatusHistory(
  studentId: number,
  params: PaginationParams = {}
): Promise<PaginationResult<StatusHistoryRecord>> {
  const { skip = 0, limit = 20 } = params
  const response = await client.get<PaginatedApiResponse<StatusHistoryRecord>>(
    `/students/${studentId}/status-history`,
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

// Get Attendance History
export async function getAttendanceHistory(
  studentId: number,
  params: PaginationParams & { group_id?: number; from_date?: string; to_date?: string } = {}
): Promise<PaginationResult<AttendanceHistoryRecord>> {
  const { skip = 0, limit = 50, group_id, from_date, to_date } = params
  const response = await client.get<PaginatedApiResponse<AttendanceHistoryRecord>>(
    `/students/${studentId}/attendance-history`,
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
