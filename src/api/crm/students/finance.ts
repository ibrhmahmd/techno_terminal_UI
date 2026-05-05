// Student Finance & Balance Operations
// Endpoints: balance, enrollment balance, unpaid enrollments, adjust balance

import client from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { StudentBalance, EnrollmentBalance, BalanceAdjustmentResult, UnpaidEnrollment } from './types/finance'
import type { BalanceAdjustmentDTO } from './types/inputs'

// Get Student Balance
export async function getStudentBalance(
  studentId: number,
  useMaterialized: boolean = true
): Promise<StudentBalance> {
  const response = await client.get<ApiResponse<StudentBalance>>(
    `/students/${studentId}/balance`,
    { params: { use_materialized: useMaterialized } }
  )
  return response.data.data
}

// Get Enrollment Balance
export async function getEnrollmentBalance(
  studentId: number,
  enrollmentId: number
): Promise<EnrollmentBalance> {
  const response = await client.get<ApiResponse<EnrollmentBalance>>(
    `/students/${studentId}/balance/enrollments/${enrollmentId}`
  )
  return response.data.data
}

// List Unpaid Enrollments
export async function getUnpaidEnrollments(
  params: PaginationParams & { group_id?: number } = {}
): Promise<PaginationResult<UnpaidEnrollment>> {
  const { skip = 0, limit = 50, group_id } = params
  // Backend limits limit to 200 max
  const cappedLimit = Math.min(limit, 200)
  const response = await client.get<PaginatedApiResponse<UnpaidEnrollment>>(
    '/balance/unpaid-enrollments',
    { params: { skip, limit: cappedLimit, group_id } }
  )
  
  const items = response.data.data || []
  const total = response.data.total || 0
  
  return {
    items,
    total,
    hasMore: total > skip + items.length
  }
}

// Adjust Student Balance (Admin only)
export async function adjustStudentBalance(
  studentId: number,
  data: BalanceAdjustmentDTO
): Promise<BalanceAdjustmentResult> {
  const response = await client.post<ApiResponse<BalanceAdjustmentResult>>(
    `/students/${studentId}/balance/adjust`,
    data
  )
  return response.data.data
}
