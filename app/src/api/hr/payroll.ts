import client from '../client'
import type { PayrollRecord } from './types'

export async function getPayroll(month: string, year: number): Promise<PayrollRecord[]> {
  const response = await client.get<{ data: PayrollRecord[] }>('/hr/payroll', {
    params: { month, year }
  })
  return response.data.data || []
}

export async function processPayroll(employeeId: number, month: string, year: number): Promise<PayrollRecord> {
  const response = await client.post<{ data: PayrollRecord }>('/hr/payroll/process', {
    employee_id: employeeId,
    month,
    year
  })
  return response.data.data
}

export async function markPayrollPaid(id: number): Promise<PayrollRecord> {
  const response = await client.patch<{ data: PayrollRecord }>(`/hr/payroll/${id}/mark-paid`)
  return response.data.data
}
