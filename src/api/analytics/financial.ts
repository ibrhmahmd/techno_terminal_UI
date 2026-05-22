/**
 * Analytics API - Financial Module
 * Endpoints for financial metrics: revenue tracking, balances, debtors analysis
 * 
 * @module analytics/financial
 * @see docs/api/analytics/financial.md
 */

import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  RevenueByDateDTO,
  RevenueByMethodDTO,
  OutstandingByGroupDTO,
  TopDebtorDTO,
  RevenueMetricsDTO,
  RevenueForecastDTO,
} from './types'

/**
 * Get daily revenue totals within a date range
 * @param start - Start date (YYYY-MM-DD)
 * @param end - End date (YYYY-MM-DD)
 * @see docs/api/analytics/financial.md#get-revenue-by-date
 */
export async function getRevenueByDate(start: string, end: string): Promise<RevenueByDateDTO[]> {
  const response = await client.get<ApiResponse<RevenueByDateDTO[]>>('/analytics/finance/revenue-by-date', {
    params: { start, end }
  })
  return response.data.data || []
}

/**
 * Get revenue totals grouped by payment method
 * @param start - Start date (YYYY-MM-DD)
 * @param end - End date (YYYY-MM-DD)
 * @see docs/api/analytics/financial.md#get-revenue-by-method
 */
export async function getRevenueByMethod(start: string, end: string): Promise<RevenueByMethodDTO[]> {
  const response = await client.get<ApiResponse<RevenueByMethodDTO[]>>('/analytics/finance/revenue-by-method', {
    params: { start, end }
  })
  return response.data.data || []
}

/**
 * Get outstanding balances grouped by group
 * @see docs/api/analytics/financial.md#get-outstanding-by-group
 */
export async function getOutstandingByGroup(): Promise<OutstandingByGroupDTO[]> {
  const response = await client.get<ApiResponse<OutstandingByGroupDTO[]>>('/analytics/finance/outstanding-by-group')
  return response.data.data || []
}

/**
 * Get top debtors for targeted collection
 * @param limit - Maximum number of debtors to return
 * @see docs/api/analytics/financial.md#get-top-debtors
 */
export async function getTopDebtors(limit?: number): Promise<TopDebtorDTO[]> {
  const params = limit ? { params: { limit } } : {}
  const response = await client.get<ApiResponse<TopDebtorDTO[]>>('/analytics/finance/top-debtors', params)
  return response.data.data || []
}

/**
 * Get revenue metrics summary
 * @see docs/api/analytics/financial.md#get-revenue-metrics
 */
export async function getRevenueMetrics(months?: number): Promise<RevenueMetricsDTO> {
  const params: Record<string, number> = {}
  if (months) params.months = months

  const response = await client.get<ApiResponse<RevenueMetricsDTO>>(
    '/analytics/finance/revenue-metrics',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data
}

/**
 * Get revenue forecast
 * @param periods - Number of periods to forecast
 * @see docs/api/analytics/financial.md#get-revenue-forecast
 */
export async function getRevenueForecast(monthsAhead?: number): Promise<RevenueForecastDTO[]> {
  const params: Record<string, number> = {}
  if (monthsAhead) params.months_ahead = monthsAhead  // FIX: was 'periods'

  const response = await client.get<ApiResponse<RevenueForecastDTO[]>>(
    '/analytics/finance/revenue-forecast',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}

