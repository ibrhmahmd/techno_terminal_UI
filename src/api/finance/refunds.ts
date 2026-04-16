/**
 * Finance API - Refunds Module
 * Refund processing and risk assessment
 * 
 * @module finance/refunds
 * @see docs/api/finance/refunds.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  RefundRequest,
  RefundResult,
  RiskAssessment,
  CreateReceiptRequest,
  OverpaymentRisk,
} from './types'

/**
 * Issue a refund for a previous payment
 * @param request - Refund details
 * @see docs/api/finance/refunds.md#issue-refund
 */
export async function issueRefund(request: RefundRequest): Promise<RefundResult> {
  const response = await client.post<ApiResponse<RefundResult>>('/finance/refunds', request)
  return response.data.data
}

/**
 * Preview potential overpayment/credit creation before creating a receipt
 * @param request - Receipt data to preview
 * @see docs/api/finance/refunds.md#preview-overpayment-risk
 */
export async function previewOverpaymentRisk(request: CreateReceiptRequest): Promise<OverpaymentRisk> {
  const response = await client.post<ApiResponse<OverpaymentRisk>>('/finance/risk/overpayment', request)
  return response.data.data
}

/**
 * Preview refund risk before processing
 * @param request - Refund data to preview
 * @see docs/api/finance/refunds.md#preview-refund-risk
 */
export async function previewRefundRisk(request: RefundRequest): Promise<RiskAssessment> {
  const response = await client.post<ApiResponse<RiskAssessment>>('/finance/refunds/preview-risk', request)
  return response.data.data
}
