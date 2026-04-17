// Student Search Operations
// Endpoints: search by name, advanced filtering

import client from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { Student, StudentListItem, StudentStatus } from './types/models'

// Search Students by Name
export async function searchStudents(query: string): Promise<StudentListItem[]> {
  const response = await client.get<PaginatedApiResponse<StudentListItem>>('/crm/students', {
    params: { q: query, skip: 0, limit: 50 }
  })
  return response.data.data || []
}

// Grouped Students Result
export interface StudentGroupedResultDTO {
  groups: Record<string, number>
  total: number
}

// Get Students Grouped
export async function getStudentsGrouped(
  groupBy: 'status' | 'gender' | 'age_bucket' = 'status',
  includeInactive: boolean = false
): Promise<StudentGroupedResultDTO> {
  const response = await client.get<ApiResponse<StudentGroupedResultDTO>>(
    '/crm/students/grouped',
    { params: { group_by: groupBy, include_inactive: includeInactive } }
  )
  return response.data.data
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
