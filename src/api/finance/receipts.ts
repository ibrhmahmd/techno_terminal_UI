/**
 * Finance API - Receipts Module
 * Receipt creation, generation, and management
 * 
 * @module finance/receipts
 * @see docs/api/finance/receipts.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  ReceiptDetail,
  ReceiptListItem,
  CreateReceiptRequest,
  ReceiptSearchParams,
  BatchGenerateRequest,
} from './types'

/**
 * Create a new receipt with payment line items
 * @param request - Receipt creation data
 * @see docs/api/finance/receipts.md#create-receipt
 */
export async function createReceipt(
  request: CreateReceiptRequest
): Promise<{ id: number; receipt_number: string }> {
  const response = await client.post<ApiResponse<{ id: number; receipt_number: string }>>(
    '/finance/receipts',
    request
  )
  return response.data.data
}

/**
 * Search receipts with filters
 * @param params - Search parameters (date range, payer, etc.)
 * @see docs/api/finance/receipts.md#search-receipts
 */
export async function searchReceipts(params: ReceiptSearchParams): Promise<ReceiptListItem[]> {
  const response = await client.get<ApiResponse<ReceiptListItem[]>>('/finance/receipts', { params })
  return response.data.data || []
}

/**
 * Get detailed receipt information
 * @param receiptId - Receipt ID
 * @see docs/api/finance/receipts.md#get-receipt-details
 */
export async function getReceiptDetails(receiptId: number): Promise<ReceiptDetail> {
  const response = await client.get<ApiResponse<ReceiptDetail>>(`/finance/receipts/${receiptId}`)
  return response.data.data
}

/**
 * Download receipt as PDF
 * @param receiptId - Receipt ID
 * @see docs/api/finance/receipts.md#generate-receipt-pdf
 */
export async function downloadReceiptPdf(receiptId: number): Promise<Blob> {
  const response = await client.get(`/finance/receipts/${receiptId}/pdf`, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Generate receipt in text format
 * @param receiptId - Receipt ID
 * @see docs/api/finance/receipts.md#generate-receipt-text
 */
export async function generateReceiptText(receiptId: number): Promise<string> {
  const response = await client.get<ApiResponse<string>>(`/finance/receipts/${receiptId}/generate`)
  return response.data.data
}

/**
 * Mark receipt as sent to parent
 * @param receiptId - Receipt ID
 * @see docs/api/finance/receipts.md#mark-receipt-as-sent
 */
export async function markReceiptAsSent(receiptId: number): Promise<void> {
  await client.patch<ApiResponse<void>>(`/finance/receipts/${receiptId}/mark-sent`)
}

/**
 * Batch generate multiple receipts
 * @param params - Batch generation parameters
 * @see docs/api/finance/receipts.md#batch-generate-receipts
 */
export async function batchGenerateReceipts(params: BatchGenerateRequest): Promise<ReceiptListItem[]> {
  const response = await client.post<ApiResponse<ReceiptListItem[]>>('/finance/receipts/batch-generate', params)
  return response.data.data || []
}
