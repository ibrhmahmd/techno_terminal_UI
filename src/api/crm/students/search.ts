// Student Search Operations
// Endpoints: search by name, advanced filtering

import { client } from '../../client'
import type { PaginationParams } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { StudentListItem, StudentFilterResult } from './types/models'

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
    filterParams?: StudentFilterParams // Advanced filter criteria
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
        // Forward advanced filter params to backend
        ...(filters?.filterParams ? {
          min_age: filters.filterParams.min_age,
          max_age: filters.filterParams.max_age,
          status: filters.filterParams.status,
          gender: filters.filterParams.gender,
          course_ids: filters.filterParams.course_ids?.join(','),
          group_default_day: filters.filterParams.group_default_day,
          instructor_name: filters.filterParams.instructor_name,
          has_any_outstanding_balance: filters.filterParams.has_any_outstanding_balance,
          enrollment_date_from: filters.filterParams.enrollment_date_from,
          enrollment_date_to: filters.filterParams.enrollment_date_to,
          min_enrollments: filters.filterParams.min_enrollments,
          max_enrollments: filters.filterParams.max_enrollments,
          exclude_course_ids: filters.filterParams.exclude_course_ids?.join(','),
          course_enrollment_date_from: filters.filterParams.course_enrollment_date_from,
          course_enrollment_date_to: filters.filterParams.course_enrollment_date_to,
          min_activity_count: filters.filterParams.min_activity_count,
          max_activity_count: filters.filterParams.max_activity_count,
          activity_types: filters.filterParams.activity_types,
          activity_date_from: filters.filterParams.activity_date_from,
          activity_date_to: filters.filterParams.activity_date_to,
          activity_search_term: filters.filterParams.activity_search_term,
        } : {}),
      },
    }
  )

  return response.data.data
}

// Filter Parameters for /crm/students/filter endpoint
export interface StudentFilterParams {
  min_age?: number
  max_age?: number
  status?: ('active' | 'waiting' | 'inactive')[]
  gender?: ('male' | 'female' | 'unknown')[]
  course_ids?: number[]
  group_default_day?: string[]
  instructor_name?: string
  has_any_outstanding_balance?: boolean
  enrollment_date_from?: string  // YYYY-MM-DD
  enrollment_date_to?: string    // YYYY-MM-DD
  min_enrollments?: number
  max_enrollments?: number
  exclude_course_ids?: number[]
  course_enrollment_date_from?: string  // YYYY-MM-DD
  course_enrollment_date_to?: string    // YYYY-MM-DD
  min_activity_count?: number
  max_activity_count?: number
  activity_types?: string[]
  activity_date_from?: string  // YYYY-MM-DD
  activity_date_to?: string    // YYYY-MM-DD
  activity_search_term?: string
  skip?: number
  limit?: number
}

// Filter students with advanced criteria
export async function filterStudents(
  params: StudentFilterParams = {}
): Promise<StudentFilterResult> {
  const response = await client.get<ApiResponse<StudentFilterResult>>(
    '/crm/students/filter',
    {
      params: {
        min_age: params.min_age,
        max_age: params.max_age,
        status: params.status,
        gender: params.gender,
        course_ids: params.course_ids?.join(','),
        group_default_day: params.group_default_day,
        instructor_name: params.instructor_name,
          has_any_outstanding_balance: params.has_any_outstanding_balance,
        enrollment_date_from: params.enrollment_date_from,
        enrollment_date_to: params.enrollment_date_to,
        min_enrollments: params.min_enrollments,
        max_enrollments: params.max_enrollments,
        exclude_course_ids: params.exclude_course_ids?.join(','),
        course_enrollment_date_from: params.course_enrollment_date_from,
        course_enrollment_date_to: params.course_enrollment_date_to,
        min_activity_count: params.min_activity_count,
        max_activity_count: params.max_activity_count,
        activity_types: params.activity_types,
        activity_date_from: params.activity_date_from,
        activity_date_to: params.activity_date_to,
        activity_search_term: params.activity_search_term,
        skip: params.skip ?? 0,
        limit: params.limit ?? 50,
      },
      paramsSerializer: {
        indexes: null, // Handle arrays as repeated params (status=active&status=waiting)
      },
    }
  )
  return response.data.data
}

