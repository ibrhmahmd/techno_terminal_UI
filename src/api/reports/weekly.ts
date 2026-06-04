import { client } from '../client'
import type { ApiResponse } from '../../types/api'

export interface PeriodReportData {
  total_revenue: number
  new_students: number
  attendance_rate: number
  new_enrollments: number
  active_students: number
  total_sessions: number
  debtor_count: number
  total_debt: number
  dropped_enrollments: number
  top_groups: string
  revenue_by_course: string
  top_courses: string
  revenue_breakdown: string
}

export async function getWeeklyReportData(targetDate: string): Promise<ApiResponse<PeriodReportData>> {
  const response = await client.get<ApiResponse<PeriodReportData>>('/notifications/reports/weekly/data', {
    params: { target_date: targetDate },
  })
  return response.data
}

export async function sendWeeklyReportEmail(targetDate: string, recipients: string[]): Promise<ApiResponse<string>> {
  const response = await client.post<ApiResponse<string>>(
    '/notifications/reports/weekly',
    { email_recipients: recipients },
    { params: { target_date: targetDate } }
  )
  return response.data
}
