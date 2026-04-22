// Core Student CRUD Operations
// Endpoints: GET /crm/students, POST /crm/students, PATCH /crm/students/{id}, DELETE /crm/students/{id}

import client from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { Student, StudentWithDetails, StudentListItem, Parent, ParentInfo } from './types/models'
import type { CreateStudentDTO, UpdateStudentDTO } from './types/inputs'

// Pagination Result Helpers
function createPaginationResult<T>(response: { data: PaginatedApiResponse<T> }, params: PaginationParams): PaginationResult<T> {
  const items = response.data.data || []
  const total = response.data.total || 0
  const skip = params.skip || 0
  return {
    items,
    total,
    hasMore: total > skip + items.length
  }
}

// Get Students Paginated
export async function getStudentsPaginated(
  params: PaginationParams = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<PaginatedApiResponse<Student>>(
    '/crm/students',
    { params: { skip, limit } }
  )
  return createPaginationResult(response, params)
}

// Get Student by ID
export async function getStudentById(id: number): Promise<Student> {
  const response = await client.get<ApiResponse<Student>>(`/crm/students/${id}`)
  return response.data.data
}

// Get Student with Full Details
export async function getStudentWithDetails(id: number): Promise<StudentWithDetails> {
  const response = await client.get<ApiResponse<StudentWithDetails>>(`/crm/students/${id}/details`)
  return response.data.data
}

// Create Student
export async function createStudent(data: CreateStudentDTO): Promise<Student> {
  console.log('[DEBUG] Creating student with data:', JSON.stringify(data, null, 2))
  try {
    // API expects data wrapped in student_data field
    const requestBody = { student_data: data }
    console.log('[DEBUG] Sending wrapped data:', JSON.stringify(requestBody, null, 2))
    const response = await client.post<ApiResponse<Student>>('/crm/students', requestBody)
    console.log('[DEBUG] Create student success:', response.data)
    return response.data.data
  } catch (error: any) {
    console.error('[DEBUG] Create student failed:')
    console.error('[DEBUG] Request URL:', '/crm/students')
    console.error('[DEBUG] Request data:', JSON.stringify(data, null, 2))
    console.error('[DEBUG] Error status:', error.response?.status)
    console.error('[DEBUG] Error status text:', error.response?.statusText)
    console.error('[DEBUG] Error response data:', JSON.stringify(error.response?.data, null, 2))
    console.error('[DEBUG] Error message:', error.message)
    throw error
  }
}

// Update Student
export async function updateStudent(id: number, data: UpdateStudentDTO): Promise<Student> {
  const response = await client.patch<ApiResponse<Student>>(`/crm/students/${id}`, data)
  return response.data.data
}

// Delete Student
export async function deleteStudent(id: number): Promise<void> {
  await client.delete(`/crm/students/${id}`)
}

// Soft Delete Student (marks as deleted without removing from DB)
export async function softDeleteStudent(id: number): Promise<void> {
  await client.delete(`/crm/students/${id}/soft`)
}

// Restore Soft-Deleted Student
export async function restoreStudent(id: number): Promise<Student> {
  const response = await client.post<ApiResponse<Student>>(`/crm/students/${id}/restore`)
  return response.data.data
}

// Hard Delete Student (permanently removes from DB)
export async function hardDeleteStudent(id: number): Promise<void> {
  await client.delete(`/crm/students/${id}/hard`)
}

// Get All Soft-Deleted Students (admin only)
export async function getDeletedStudents(
  params: PaginationParams = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 50 } = params
  const response = await client.get<PaginatedApiResponse<Student>>(
    '/crm/admin/deleted-students',
    { params: { skip, limit } }
  )
  return createPaginationResult(response, params)
}

// Get Parent by ID (helper for student profile)
export async function getParentById(id: number): Promise<Parent> {
  const response = await client.get<ApiResponse<Parent>>(`/crm/parents/${id}`)
  return response.data.data
}

// Get Student Parents
export async function getStudentParents(studentId: number): Promise<ParentInfo[]> {
  const response = await client.get<ApiResponse<ParentInfo[]>>(
    `/crm/students/${studentId}/parents`
  )
  return response.data.data || []
}
