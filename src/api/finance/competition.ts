/**
 * Finance API - Competition Module
 * Competition fee management
 * 
 * @module finance/competition
 * @see docs/api/finance/competition.md
 */

import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { UnpaidCompFeeItem } from './types'

/**
 * Get unpaid competition fees for a student
 * @param studentId - Student ID
 * @see docs/api/finance/competition.md#get-unpaid-competition-fees
 */
export async function getUnpaidCompetitionFees(studentId: number): Promise<UnpaidCompFeeItem[]> {
  const response = await client.get<ApiResponse<UnpaidCompFeeItem[]>>(
    '/finance/competition-fees',
    { params: { student_id: studentId } }
  )
  return response.data.data || []
}

