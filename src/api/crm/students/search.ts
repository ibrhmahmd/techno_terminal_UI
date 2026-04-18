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

// Group data structure with students
export interface StudentGroup {
  key: string // 'active', 'waiting', '4-7', 'competition-name', etc.
  label: string // 'Active Students', 'Ages 4-6', 'Competition XYZ'
  count: number // Total count in this group
  students: StudentListItem[] // Paginated students
}

// Grouped Students Result with pagination
export interface StudentGroupedResultDTO {
  groups: StudentGroup[]
  total: number
  groupBy: 'status' | 'age' | 'competition'
  skip: number
  limit: number
}

// Get Students Grouped with pagination and custom age buckets
export async function getStudentsGrouped(
  groupBy: 'status' | 'age' = 'status',
  params: PaginationParams = {},
  filters?: {
    includeInactive?: boolean
    statusFilter?: 'active' | 'waiting' | 'inactive' // For waiting tab
    ageBuckets?: { min: number; max: number; label: string; key: string }[]
  }
): Promise<StudentGroupedResultDTO> {
  const { skip = 0, limit = 50 } = params

  // Map frontend 'age' to backend 'age_bucket'
  const backendGroupBy = groupBy === 'age' ? 'age_bucket' : groupBy

  const response = await client.get<ApiResponse<StudentGroupedResultDTO>>(
    '/crm/students/grouped',
    {
      params: {
        group_by: backendGroupBy,
        skip,
        limit,
        include_inactive: filters?.includeInactive,
        status_filter: filters?.statusFilter,
        age_buckets: filters?.ageBuckets ? JSON.stringify(filters.ageBuckets) : undefined,
      },
    }
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
