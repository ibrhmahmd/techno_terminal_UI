import client from '../client'
import type { PaginationParams, PaginationResult } from '../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../types/api'
import type { Student, StudentWithDetails } from './types'

export async function getStudentsPaginated(
  params: PaginationParams = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<PaginatedApiResponse<Student>>(
    '/crm/students',
    { params: { skip, limit } }
  )
  
  const paginatedData = response.data
  const items = paginatedData.data || []
  const total = paginatedData.total || 0
  
  return {
    items: items,
    total: total,
    hasMore: total > (skip + items.length)
  }
}

export async function searchStudents(name: string): Promise<Student[]> {
  const response = await client.get<ApiResponse<Student[]>>('/crm/students', {
    params: { name }
  })
  return response.data.data || []
}

export async function getStudent(id: number): Promise<StudentWithDetails> {
  const response = await client.get<ApiResponse<StudentWithDetails>>(`/crm/students/${id}`)
  return response.data.data
}

export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const response = await client.post<ApiResponse<Student>>('/crm/students', student)
  return response.data.data
}

export async function updateStudent(id: number, student: Partial<Omit<Student, 'id'>>): Promise<Student> {
  const response = await client.patch<ApiResponse<Student>>(`/crm/students/${id}`, student)
  return response.data.data
}

export async function deleteStudent(id: number): Promise<void> {
  await client.delete(`/crm/students/${id}`)
}
