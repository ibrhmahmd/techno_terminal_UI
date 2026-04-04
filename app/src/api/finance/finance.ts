import client from '../client'
import type { 
  StudentBalance, ReceiptSearchParams, Receipt,
  CreateReceiptRequest, OverpaymentRisk 
} from './types'

export async function getStudentBalance(studentId: number): Promise<StudentBalance> {
  const response = await client.get<{ data: StudentBalance }>(`/finance/students/${studentId}/balance`)
  return response.data.data
}

export async function searchReceipts(params: ReceiptSearchParams): Promise<Receipt[]> {
  const response = await client.get<{ data: Receipt[] }>('/finance/receipts', { params })
  return response.data.data || []
}

export async function createReceipt(request: CreateReceiptRequest): Promise<{ id: number; receipt_number: string }> {
  const response = await client.post<{ success: boolean; data: { id: number; receipt_number: string } }>('/finance/receipts', request)
  return response.data.data
}

export async function previewOverpaymentRisk(request: CreateReceiptRequest): Promise<OverpaymentRisk> {
  const response = await client.post<{ success: boolean; data: OverpaymentRisk }>('/finance/receipts/preview', request)
  return response.data.data
}

export async function downloadReceiptPdf(receiptId: number): Promise<Blob> {
  const response = await client.get(`/finance/receipts/${receiptId}/pdf`, {
    responseType: 'blob'
  })
  return response.data
}
