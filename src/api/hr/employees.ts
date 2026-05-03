import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { EmployeePublic, EmployeeListItem, EmployeeCreateInput } from './types'

interface GetEmployeesParams {
  page?: number
  page_size?: number
}

export async function getEmployees(
  params: GetEmployeesParams = {}
): Promise<ApiResponse<EmployeeListItem[]>> {
  const { page = 1, page_size = 20 } = params
  // Cap page_size at 100 to match backend API maximum
  const capped_page_size = Math.min(page_size, 100)
  const response = await client.get<ApiResponse<EmployeeListItem[]>>(
    '/hr/employees',
    { params: { page, page_size: capped_page_size } }
  )
  return response.data
}

/**
 * @deprecated Use getEmployees() instead. This function is kept for backward compatibility.
 */
export async function getEmployeesPaginated(
  params: { skip?: number; limit?: number } = {}
): Promise<{ items: EmployeePublic[]; total: number; hasMore: boolean }> {
  const { skip = 0, limit = 50 } = params
  const page = Math.floor(skip / limit) + 1
  const page_size = limit
  
  const result = await getEmployees({ page, page_size })
  const data = result.data || []
  
  return {
    items: data as EmployeePublic[],
    total: data.length,
    hasMore: data.length === page_size
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

/**
 * @deprecated This endpoint is not implemented in the backend API.
 * Keeping for reference but will throw an error if called.
 */
export async function deleteEmployee(_id: number): Promise<void> {
  void _id // Mark as intentionally used (suppress lint)
  throw new Error('Delete employee endpoint is not implemented in the backend API')
}

/**
 * @deprecated This endpoint is not implemented in the backend API.
 * HR stats functionality is planned for future release.
 */
export async function getHRStats(): Promise<{
  total_employees: number
  active_employees: number
  on_leave: number
  present_today: number
  late_today: number
  absent_today: number
  monthly_payroll_total: number
}> {
  throw new Error('HR stats endpoint is not implemented in the backend API')
}
