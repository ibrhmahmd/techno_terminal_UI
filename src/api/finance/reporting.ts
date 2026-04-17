/**
 * Finance Reporting API
 * Daily collection summaries and receipt listings for financial reporting
 * 
 * @module finance/reporting
 * @see docs/api/finance/reporting.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { DailyCollectionItem, DailyReceiptItem } from './types'

/**
 * Get daily collection summary grouped by payment method
 * @param targetDate - Optional date filter (YYYY-MM-DD), defaults to today
 * @see docs/api/finance/reporting.md#get-finance-reports-daily-collections
 */
export async function getDailyCollections(targetDate?: string): Promise<DailyCollectionItem[]> {
  const params: Record<string, string> = {}
  if (targetDate) params.target_date = targetDate

  const response = await client.get<ApiResponse<DailyCollectionItem[]>>(
    '/finance/reports/daily-collections',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}

/**
 * Get all receipts issued on a specific date
 * @param targetDate - Optional date filter (YYYY-MM-DD), defaults to today
 * @see docs/api/finance/reporting.md#get-finance-reports-daily-receipts
 */
export async function getDailyReceipts(targetDate?: string): Promise<DailyReceiptItem[]> {
  const params: Record<string, string> = {}
  if (targetDate) params.target_date = targetDate

  const response = await client.get<ApiResponse<DailyReceiptItem[]>>(
    '/finance/reports/daily-receipts',
    { params: Object.keys(params).length > 0 ? params : undefined }
  )
  return response.data.data || []
}
