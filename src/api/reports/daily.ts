import { client } from '../client'
import type { ApiResponse } from '../../types/api'

export interface PaymentDetail {
  student_name: string
  group_name: string
  amount: number
  payment_type: string
}

export interface SessionDetail {
  instructor_name: string
  session_time: string
  present_count: number
  absent_count: number
  cancelled_count: number
  student_names_present: string
  student_names_absent: string
}

export interface PaymentsByTypeItem {
  payment_type: string
  subtotal: number
  count: number
  items: PaymentDetail[]
}

export interface InstructorSummaryItem {
  instructor_name: string
  session_count: number
}

export interface DailyReportData {
  date: string
  total_revenue: number
  new_enrollments: number
  sessions_held: number
  present_count: number
  absent_count: number
  attendance_rate: number
  payment_count: number
  payment_methods: Record<string, number>
  payment_details: PaymentDetail[]
  instructors_list: string[]
  session_details: SessionDetail[]
  payments_by_type: PaymentsByTypeItem[]
  instructor_summary: InstructorSummaryItem[]
}

export interface DailyReportPdf {
  date: string
  pdf_base64: string
}

export interface EmailSendPayload {
  email_recipients: string[]
}

export async function getDailyReportData(targetDate: string): Promise<ApiResponse<DailyReportData>> {
  const response = await client.get<ApiResponse<DailyReportData>>('/notifications/reports/daily/data', {
    params: { target_date: targetDate },
  })
  return response.data
}

export async function getDailyReportPdf(targetDate: string): Promise<ApiResponse<DailyReportPdf>> {
  const response = await client.post<ApiResponse<DailyReportPdf>>('/notifications/reports/daily', null, {
    params: { target_date: targetDate },
  })
  return response.data
}

export async function sendDailyReportEmail(targetDate: string, recipients: string[]): Promise<ApiResponse<string>> {
  const response = await client.post<ApiResponse<string>>(
    '/notifications/reports/daily',
    { email_recipients: recipients },
    { params: { target_date: targetDate } }
  )
  return response.data
}
