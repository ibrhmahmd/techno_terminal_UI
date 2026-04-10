/**
 * Finance API - Balance Module
 * Balance operations: inquiry, adjustments, credit management
 * 
 * @module finance/balance
 * @see docs/api/finance/balance.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { CreditInfo, BalanceSummary } from './types'
import type { StudentBalance, EnrollmentBalance, BalanceAdjustmentResult, UnpaidEnrollment } from '../crm/students/types/finance'
import type { BalanceAdjustmentDTO } from '../crm/students/types/inputs'
import type { PaginationParams, PaginationResult } from '../../types/pagination'
import type { PaginatedApiResponse } from '../../types/api'

/**
 * Get comprehensive balance information for a student
 * @param studentId - Student ID
 * @param useMaterialized - Use fast materialized balance if available
 * @see docs/api/finance/balance.md#get-student-balance
 */
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

/**
 * Get detailed balance for a specific enrollment
 * @param studentId - Student ID
 * @param enrollmentId - Enrollment ID
 * @see docs/api/finance/balance.md#get-enrollment-balance
 */
export async function getEnrollmentBalance(
  studentId: number,
  enrollmentId: number
): Promise<EnrollmentBalance> {
  const response = await client.get<ApiResponse<EnrollmentBalance>>(
    `/students/${studentId}/balance/enrollments/${enrollmentId}`
  )
  return response.data.data
}

/**
 * List all unpaid enrollments across all students
 * @param params - Pagination and filtering options
 * @see docs/api/finance/balance.md#list-unpaid-enrollments
 */
export async function getUnpaidEnrollments(
  params: PaginationParams & { group_id?: number } = {}
): Promise<PaginationResult<UnpaidEnrollment>> {
  const { skip = 0, limit = 50, group_id } = params
  const response = await client.get<PaginatedApiResponse<UnpaidEnrollment>>(
    '/balance/unpaid-enrollments',
    { params: { skip, limit, group_id } }
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
 * Adjust student balance (Admin only)
 * @param studentId - Student ID
 * @param data - Adjustment details
 * @see docs/api/finance/balance.md#adjust-student-balance
 */
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

/**
 * Get student credit information
 * @param studentId - Student ID
 * @see docs/api/finance/balance.md#get-student-credit-info
 */
export async function getStudentCreditInfo(studentId: number): Promise<CreditInfo> {
  const response = await client.get<ApiResponse<CreditInfo>>(
    `/finance/credit/student/${studentId}`
  )
  return response.data.data
}

/**
 * Get balance summary across all students
 * @see docs/api/finance/balance.md#get-balance-summary
 */
export async function getBalanceSummary(): Promise<BalanceSummary> {
  const response = await client.get<ApiResponse<BalanceSummary>>(
    '/finance/balance-summary'
  )
  return response.data.data
}
