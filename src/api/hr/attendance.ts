import client from '../client'
import type { AttendanceRecord, LogAttendanceInput } from './types'

export async function getAttendance(date?: string, employeeId?: number): Promise<AttendanceRecord[]> {
  const params: Record<string, any> = {}
  if (date) params.date = date
  if (employeeId) params.employee_id = employeeId
  
  const response = await client.get<{ data: AttendanceRecord[] }>('/hr/attendance', {
    params: Object.keys(params).length > 0 ? params : undefined
  })
  return response.data.data || []
}

export async function logAttendance(data: LogAttendanceInput): Promise<AttendanceRecord> {
  const response = await client.post<{ data: AttendanceRecord }>('/hr/attendance/log', data)
  return response.data.data
}

export async function updateAttendance(id: number, data: Partial<LogAttendanceInput>): Promise<AttendanceRecord> {
  const response = await client.patch<{ data: AttendanceRecord }>(`/hr/attendance/${id}`, data)
  return response.data.data
}
