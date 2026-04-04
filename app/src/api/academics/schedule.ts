import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { DailyScheduleItem } from './types'

export async function getDailySchedule(date?: string): Promise<DailyScheduleItem[]> {
  const params = date ? { params: { target_date: date } } : {}
  const response = await client.get<ApiResponse<DailyScheduleItem[]>>(
    '/academics/sessions/daily-schedule', params
  )
  return response.data.data || []
}
