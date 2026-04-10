// Core Student CRUD Operations
// Endpoints: GET /crm/students, POST /crm/students, PATCH /crm/students/{id}, DELETE /crm/students/{id}

import client from '../../client'
import type { AxiosError } from 'axios'
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../../types/api'
import type { Student, StudentWithDetails, Parent } from './types/models'
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
  const response = await client.post<ApiResponse<Student>>('/crm/students', data)
  return response.data.data
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

// Get Parent by ID (helper for student profile)
export async function getParentById(id: number): Promise<Parent> {
  const response = await client.get<ApiResponse<Parent>>(`/crm/parents/${id}`)
  return response.data.data
}
