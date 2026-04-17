/**
 * Analytics API Types - Financial Module
 * DTOs for financial metrics: revenue tracking and debtors analysis
 * @see docs/api/analytics/financial.md
 */

export interface RevenueByDateDTO {
  day: string
  net_revenue: number
}

export interface RevenueByMethodDTO {
  payment_method: string
  net_revenue: number
  receipt_count: number
}

export interface OutstandingByGroupDTO {
  group_id: number
  group_name: string
  course_name: string
  students_with_balance: number
  total_outstanding: number
}

export interface TopDebtorDTO {
  student_id: number
  student_name: string
  parent_name: string
  phone_primary: string
  total_balance: number
}

export interface RevenueMetricsDTO {
  period_start: string
  period_end: string
  total_revenue: number
  total_receipts: number
  avg_revenue_per_receipt: number
  previous_period_revenue: number
  revenue_change_pct: number
  trend_direction: 'up' | 'down' | 'flat'
  monthly_breakdown: RevenueByDateDTO[]
}

export interface RevenueForecastDTO {
  month: string
  predicted_revenue: number
  confidence_lower: number
  confidence_upper: number
}
