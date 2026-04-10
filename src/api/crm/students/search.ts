// Student Search Operations
// Endpoints: search by name, advanced filtering

import client from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { Student, StudentStatus } from './types/models'

// Search Students by Name
export async function searchStudents(name: string): Promise<Student[]> {
  const response = await client.get<ApiResponse<Student[]>>('/crm/students', {
    params: { name }
  })
  return response.data.data || []
}

// Advanced Student Search with Filters
export interface StudentSearchFilters {
  name?: string
  status?: StudentStatus
  parent_id?: number
  group_id?: number
  has_balance?: boolean
  from_date?: string
  to_date?: string
}

export async function searchStudentsAdvanced(
  filters: StudentSearchFilters,
  params: PaginationParams = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<PaginatedApiResponse<Student>>(
    '/crm/students',
    { 
      params: { 
        skip, 
        limit,
        ...filters 
      } 
    }
  )
  
  const items = response.data.data || []
  const total = response.data.total || 0
  
  return {
    items,
    total,
    hasMore: total > skip + items.length
  }
}
