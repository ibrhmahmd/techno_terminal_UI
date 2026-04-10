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
  total_outstanding: number
  student_count: number
}

export interface TopDebtorDTO {
  student_id: number
  student_name: string
  parent_name: string
  phone_primary: string
  total_balance: number
}

export interface RevenueMetricsDTO {
  total_revenue: number
  total_collected: number
  total_outstanding: number
  collection_rate: number
  avg_revenue_per_student: number
}

export interface RevenueForecastDTO {
  period: string
  predicted_revenue: number
  confidence_lower: number
  confidence_upper: number
}
