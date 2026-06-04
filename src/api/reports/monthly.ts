import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { PeriodReportData } from './weekly'

export async function getMonthlyReportData(targetDate: string): Promise<ApiResponse<PeriodReportData>> {
  const response = await client.get<ApiResponse<PeriodReportData>>('/notifications/reports/monthly/data', {
    params: { target_date: targetDate },
  })
  return response.data
}

export async function sendMonthlyReportEmail(targetDate: string, recipients: string[]): Promise<ApiResponse<string>> {
  const response = await client.post<ApiResponse<string>>(
    '/notifications/reports/monthly',
    { email_recipients: recipients },
    { params: { target_date: targetDate } }
  )
  return response.data
}
