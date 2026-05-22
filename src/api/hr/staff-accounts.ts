import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { StaffAccountPublic, CreateEmployeeAccountRequest, EmployeeAccountResponse } from './types'

/**
 * Get all staff accounts with linked employee information
 * GET /api/v1/hr/staff-accounts
 */
export async function getStaffAccounts(): Promise<ApiResponse<StaffAccountPublic[]>> {
  const response = await client.get<ApiResponse<StaffAccountPublic[]>>('/hr/staff-accounts')
  return response.data
}

/**
 * Create a user account for an existing employee
 * POST /api/v1/hr/employees/{employee_id}/create-account
 * 
 * Creates a Supabase user account linked to the employee record.
 * Only 'admin' or 'system_admin' roles are allowed.
 */
export async function createEmployeeAccount(
  employeeId: number,
  data: CreateEmployeeAccountRequest
): Promise<ApiResponse<EmployeeAccountResponse>> {
  const response = await client.post<ApiResponse<EmployeeAccountResponse>>(
    `/hr/employees/${employeeId}/create-account`,
    data
  )
  return response.data
}

