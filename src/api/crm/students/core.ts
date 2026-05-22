// Core Student CRUD Operations
// Endpoints: GET /crm/students, POST /crm/students, PATCH /crm/students/{id}, DELETE /crm/students/{id}

import { client } from '../../client'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { Student, StudentWithDetails, Parent, ParentInfo } from './types/models'
import type { CreateStudentDTO, UpdateStudentDTO } from './types/inputs'

// Pagination Result Helpers
function createPaginationResult<T>(response: { data: PaginatedApiResponse<T> }, params: PaginationParams): PaginationResult<T> {
  const items = response.data.data || []
  const skip = params.skip || 0
  let total = response.data.total ?? 0
  if (total === 0 && items.length > 0) {
    total = items.length
  }
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
  // Backend likely limits to 100-200, use conservative default
  const cappedLimit = Math.min(limit, 100)
  const response = await client.get<PaginatedApiResponse<Student>>(
    '/crm/students',
    { params: { skip, limit: cappedLimit } }
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
  const requestBody = { student_data: data }
  const response = await client.post<ApiResponse<Student>>('/crm/students', requestBody)
  return response.data.data
}

// Update Student
export async function updateStudent(id: number, data: UpdateStudentDTO): Promise<Student> {
  const response = await client.patch<ApiResponse<Student>>(`/crm/students/${id}`, data)
  return response.data.data
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

