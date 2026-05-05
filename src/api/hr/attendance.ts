import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { AttendanceLogInput, AttendanceLogOutput } from './types'

export async function logAttendance(data: AttendanceLogInput): Promise<ApiResponse<AttendanceLogOutput>> {
  const response = await client.post<ApiResponse<AttendanceLogOutput>>('/hr/attendance/log', data)
  return response.data
}
