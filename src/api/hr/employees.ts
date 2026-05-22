import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { EmployeePublic, EmployeeListItem, EmployeeCreateInput } from './types'

interface GetEmployeesParams {
  page?: number
  page_size?: number
  q?: string
  employment_type?: string
}

export async function getEmployees(
  params: GetEmployeesParams = {}
): Promise<ApiResponse<EmployeeListItem[]> & { total: number; skip: number; limit: number }> {
  const { page = 1, page_size = 20, q, employment_type } = params
  // Cap page_size at 100 to match backend API maximum
  const capped_page_size = Math.min(page_size, 100)
  const response = await client.get<ApiResponse<EmployeeListItem[]> & { total: number; skip: number; limit: number }>(
    '/hr/employees',
    { params: { page, page_size: capped_page_size, q, employment_type } }
  )
  return response.data
}

export async function fetchEmployeesPaginated(
  params: { skip?: number; limit?: number; q?: string; employment_type?: string }
): Promise<{ items: EmployeeListItem[]; total: number; hasMore: boolean }> {
  const { skip = 0, limit = 20, q, employment_type } = params
  const page = Math.floor(skip / limit) + 1

  const result = await getEmployees({ page, page_size: limit, q, employment_type })
  const data = result.data || []

  return {
    items: data,
    total: result.total ?? data.length,
    hasMore: (result.total ?? data.length) > skip + data.length,
  }
}

export async function getEmployee(id: number): Promise<ApiResponse<EmployeePublic>> {
  const response = await client.get<ApiResponse<EmployeePublic>>(`/hr/employees/${id}`)
  return response.data
}

export async function createEmployee(data: EmployeeCreateInput): Promise<ApiResponse<EmployeePublic>> {
  const response = await client.post<ApiResponse<EmployeePublic>>('/hr/employees', data)
  return response.data
}

export async function updateEmployee(id: number, data: Partial<EmployeeCreateInput>): Promise<ApiResponse<EmployeePublic>> {
  const response = await client.put<ApiResponse<EmployeePublic>>(`/hr/employees/${id}`, data)
  return response.data
}

