import client from '../../client'
import type { StudentWithDetails } from './types/models'

export interface WaitingListParams {
  skip?: number
  limit?: number
  order_by_priority?: boolean
}

interface WaitingListResponse {
  success: boolean
  data: StudentWithDetails[]
  message: string
}

/**
 * Get students from the waiting list
 * Uses the dedicated /waiting-list endpoint that returns StudentWithDetails
 * including waiting_since, waiting_priority, and waiting_notes
 */
export async function getWaitingList(
  params: WaitingListParams = {}
): Promise<StudentWithDetails[]> {
  const response = await client.get<WaitingListResponse>(
    '/crm/students/waiting-list',
    {
      params: {
        skip: params.skip ?? 0,
        limit: params.limit ?? 200,
        order_by_priority: params.order_by_priority ?? true,
      },
    }
  )
  return response.data.data
}
