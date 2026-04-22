// Student Payments API - CRM Student Payment Endpoints

import client from '../../client'
import type {
  PaymentListItem,
  PaymentDetailsResponse,
  SendReceiptRequest,
  SendReceiptResponse,
} from './types/payments'
import type { ApiResponse } from '../../../types/api'

const CRM_BASE_URL = '/crm/students'
const FINANCE_BASE_URL = '/finance'

/**
 * Get all payments for a specific student
 * GET /api/v1/crm/students/{student_id}/payments
 */
export async function getStudentPayments(studentId: number): Promise<PaymentListItem[]> {
  const response = await client.get<ApiResponse<PaymentListItem[]>>(`${CRM_BASE_URL}/${studentId}/payments`)
  return response.data.data
}

/**
 * Get detailed payment information by ID
 * GET /api/v1/finance/payments/{payment_id}
 * Note: This is a finance endpoint, not CRM
 */
export async function getPaymentDetails(paymentId: number): Promise<PaymentDetailsResponse> {
  const response = await client.get<ApiResponse<PaymentDetailsResponse>>(`${FINANCE_BASE_URL}/payments/${paymentId}`)
  return response.data.data
}

/**
 * Send receipt to student via WhatsApp or Email
 * POST /api/v1/finance/payments/{payment_id}/send-receipt
 * Note: This is a finance endpoint, not CRM
 */
export async function sendReceiptToStudent(
  paymentId: number,
  method: 'whatsapp' | 'email'
): Promise<SendReceiptResponse> {
  const response = await client.post<ApiResponse<SendReceiptResponse>>(
    `${FINANCE_BASE_URL}/payments/${paymentId}/send-receipt`,
    { method } satisfies SendReceiptRequest
  )
  return response.data.data
}

