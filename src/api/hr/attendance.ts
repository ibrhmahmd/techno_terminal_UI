import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { AttendanceLogInput, AttendanceLogOutput } from './types'

/**
 * @deprecated This endpoint is not implemented in the backend API.
 * Only the attendance log endpoint is available.
 */
export async function getAttendance(_date?: string, _employeeId?: number): Promise<never> {
  throw new Error('Get attendance endpoint is not implemented in the backend API. Use logAttendance instead.')
}

export async function logAttendance(data: AttendanceLogInput): Promise<ApiResponse<AttendanceLogOutput>> {
  const response = await client.post<ApiResponse<AttendanceLogOutput>>('/hr/attendance/log', data)
  return response.data
}

/**
 * @deprecated This endpoint is not implemented in the backend API.
 */
export async function updateAttendance(_id: number, _data: Partial<AttendanceLogInput>): Promise<never> {
  throw new Error('Update attendance endpoint is not implemented in the backend API')
}
