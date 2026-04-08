import client from '../client'
import type { PaginationParams, PaginationResult } from '../../types/pagination'
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from './types'

export async function getEmployeesPaginated(
  params: PaginationParams = {}
): Promise<PaginationResult<Employee>> {
  const { skip = 0, limit = 50 } = params
  const response = await client.get<{ data: Employee[] }>(
    '/hr/employees',
    { params: { skip, limit } }
  )
  const data = response.data.data || []
  
  return {
    items: data,
    total: data.length,
    hasMore: data.length === limit
  }
}

export async function getEmployee(id: number): Promise<Employee> {
  const response = await client.get<{ data: Employee }>(`/hr/employees/${id}`)
  return response.data.data
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  const response = await client.post<{ data: Employee }>('/hr/employees', data)
  return response.data.data
}

export async function updateEmployee(id: number, data: UpdateEmployeeInput): Promise<Employee> {
  const response = await client.put<{ data: Employee }>(`/hr/employees/${id}`, data)
  return response.data.data
}

export async function deleteEmployee(id: number): Promise<void> {
  await client.delete(`/hr/employees/${id}`)
}

export async function getHRStats(): Promise<{
  total_employees: number
  active_employees: number
  on_leave: number
  present_today: number
  late_today: number
  absent_today: number
  monthly_payroll_total: number
}> {
  const response = await client.get<{ data: {
    total_employees: number
    active_employees: number
    on_leave: number
    present_today: number
    late_today: number
    absent_today: number
    monthly_payroll_total: number
  } }>('/hr/stats')
  return response.data.data
}
