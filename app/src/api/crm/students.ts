import client from '../client'
import type { AxiosError } from 'axios'
import type { PaginationParams, PaginationResult } from '../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../types/api'
import type { 
  Student, 
  StudentWithDetails, 
  Parent,
  SiblingInfo,
  StudentStatus,
  UpdateStudentStatusDTO,
  SetWaitingPriorityDTO,
  StudentStatusSummary,
  StatusHistoryRecord
} from './types'

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
  try {
    const payload = { student_data: student }
    console.log('[API] createStudent - Request:', { url: '/crm/students', payload })
    const response = await client.post<ApiResponse<Student>>('/crm/students', payload)
    console.log('[API] createStudent - Success:', { status: response.status, data: response.data })
    return response.data.data
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('[API] createStudent - Error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      responseData: axiosError.response?.data,
      requestUrl: axiosError.config?.url,
      requestMethod: axiosError.config?.method,
      requestPayload: axiosError.config?.data,
      headers: axiosError.response?.headers,
      stack: axiosError.stack
    })
    throw error
  }
}

export async function updateStudent(id: number, student: Partial<Omit<Student, 'id'>>): Promise<Student> {
  try {
    console.log('[API] updateStudent - Request:', { url: `/crm/students/${id}`, payload: student })
    const response = await client.patch<ApiResponse<Student>>(`/crm/students/${id}`, student)
    console.log('[API] updateStudent - Success:', { status: response.status, data: response.data })
    return response.data.data
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('[API] updateStudent - Error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      responseData: axiosError.response?.data,
      requestUrl: axiosError.config?.url,
      requestMethod: axiosError.config?.method,
      requestPayload: axiosError.config?.data,
      headers: axiosError.response?.headers,
      stack: axiosError.stack
    })
    throw error
  }
}

export async function deleteStudent(id: number): Promise<void> {
  await client.delete(`/crm/students/${id}`)
}

// Student Relationship Endpoints

export async function getStudentParents(studentId: number): Promise<Parent[]> {
  const response = await client.get<ApiResponse<Parent[]>>(`/crm/students/${studentId}/parents`)
  return response.data.data || []
}

export async function getStudentSiblings(studentId: number): Promise<SiblingInfo[]> {
  const response = await client.get<ApiResponse<SiblingInfo[]>>(`/crm/students/${studentId}/siblings`)
  return response.data.data || []
}

// Status Management Endpoints

export async function updateStudentStatus(
  studentId: number,
  data: UpdateStudentStatusDTO
): Promise<Student> {
  const response = await client.patch<ApiResponse<Student>>(
    `/crm/students/${studentId}/status`,
    data
  )
  return response.data.data
}

export async function toggleStudentStatus(
  studentId: number,
  notes?: string
): Promise<Student> {
  const response = await client.post<ApiResponse<Student>>(
    `/crm/students/${studentId}/status/toggle`,
    null,
    { params: notes ? { notes } : undefined }
  )
  return response.data.data
}

export async function getWaitingList(params: {
  skip?: number
  limit?: number
  order_by_priority?: boolean
} = {}): Promise<Student[]> {
  const { skip = 0, limit = 200, order_by_priority = true } = params
  const response = await client.get<ApiResponse<Student[]>>(
    '/crm/students/waiting-list',
    { params: { skip, limit, order_by_priority } }
  )
  return response.data.data || []
}

export async function setWaitingPriority(
  studentId: number,
  data: SetWaitingPriorityDTO
): Promise<Student> {
  const response = await client.patch<ApiResponse<Student>>(
    `/crm/students/${studentId}/waiting-priority`,
    data
  )
  return response.data.data
}

export async function getStudentsByStatus(
  status: StudentStatus,
  params: { skip?: number; limit?: number } = {}
): Promise<Student[]> {
  const { skip = 0, limit = 200 } = params
  const response = await client.get<ApiResponse<Student[]>>(
    `/crm/students/by-status/${status}`,
    { params: { skip, limit } }
  )
  return response.data.data || []
}

export async function getStudentStatusSummary(): Promise<StudentStatusSummary> {
  const response = await client.get<ApiResponse<StudentStatusSummary>>(
    '/crm/students/status-summary'
  )
  return response.data.data
}

export async function getStudentStatusHistory(
  studentId: number
): Promise<StatusHistoryRecord[]> {
  const response = await client.get<ApiResponse<StatusHistoryRecord[]>>(
    `/crm/students/${studentId}/status-history`
  )
  return response.data.data || []
}
