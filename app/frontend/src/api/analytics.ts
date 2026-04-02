import client from './client'

export interface DashboardSummary {
  total_students: number
  active_students: number
  total_groups: number
  active_groups: number
  total_enrollments: number
  active_enrollments: number
  monthly_revenue: number
  outstanding_balance: number
}

export interface AttendanceReport {
  date: string
  present_count: number
  absent_count: number
  late_count: number
  excused_count: number
  total_sessions: number
}

export interface EnrollmentTrend {
  month: string
  new_enrollments: number
  dropped_enrollments: number
  net_change: number
}

// Get dashboard summary stats
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await client.get<{ data: DashboardSummary }>('/analytics/dashboard-summary')
  return response.data.data
}

// Get attendance report for date range
export async function getAttendanceReport(fromDate: string, toDate: string): Promise<AttendanceReport[]> {
  const response = await client.get<{ data: AttendanceReport[] }>('/analytics/attendance', {
    params: { from_date: fromDate, to_date: toDate }
  })
  return response.data.data || []
}

// Get enrollment trends
export async function getEnrollmentTrends(months: number = 6): Promise<EnrollmentTrend[]> {
  const response = await client.get<{ data: EnrollmentTrend[] }>('/analytics/enrollment-trends', {
    params: { months }
  })
  return response.data.data || []
}

// Get revenue report (placeholder - API may not be ready)
export async function getRevenueReport(fromDate: string, toDate: string): Promise<{ date: string; amount: number }[]> {
  try {
    const response = await client.get<{ data: { date: string; amount: number }[] }>('/analytics/revenue', {
      params: { from_date: fromDate, to_date: toDate }
    })
    return response.data.data || []
  } catch {
    // Return mock data if API not ready
    return [
      { date: '2026-01', amount: 15000 },
      { date: '2026-02', amount: 18000 },
      { date: '2026-03', amount: 16500 }
    ]
  }
}
