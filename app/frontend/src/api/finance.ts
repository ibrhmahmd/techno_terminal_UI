import client from './client'

export interface ReceiptItem {
  enrollment_id: string
  amount: number
  type: 'tuition' | 'materials' | 'registration' | 'other'
  description?: string
}

export interface Receipt {
  id: string
  receipt_number: string
  payer_name: string
  total_amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'other'
  notes?: string
  created_at: string
  items: ReceiptItem[]
}

export interface CreateReceiptRequest {
  payer_name?: string
  student_id?: string
  payment_method: 'cash' | 'card' | 'transfer' | 'other'
  notes?: string
  items: ReceiptItem[]
}

export interface CreateReceiptResponse {
  success: boolean
  data: {
    id: string
    receipt_number: string
  }
}

export interface ReceiptSearchParams {
  from_date: string
  to_date: string
  payer_name?: string
  student_id?: string
  receipt_number?: string
}

export interface StudentBalance {
  student_id: string
  student_name: string
  total_due: number
  total_paid: number
  balance: number
  enrollments_balance: {
    enrollment_id: string
    group_name: string
    amount_due: number
    amount_paid: number
    balance: number
  }[]
}

export interface OverpaymentRisk {
  has_risk: boolean
  message?: string
  would_overpay: number
}

// Get student balance
export async function getStudentBalance(studentId: string): Promise<StudentBalance> {
  const response = await client.get<{ data: StudentBalance }>(`/finance/balance/student/${studentId}`)
  return response.data.data
}

// Search receipts
export async function searchReceipts(params: ReceiptSearchParams): Promise<Receipt[]> {
  const response = await client.get<{ data: Receipt[] }>('/finance/receipts', { params })
  return response.data.data || []
}

// Create receipt
export async function createReceipt(request: CreateReceiptRequest): Promise<{ id: string; receipt_number: string }> {
  const response = await client.post<CreateReceiptResponse>('/finance/receipts', request)
  return response.data.data
}

// Preview overpayment risk
export async function previewOverpaymentRisk(request: CreateReceiptRequest): Promise<OverpaymentRisk> {
  const response = await client.post<{ data: OverpaymentRisk }>('/finance/receipts/preview-risk', request)
  return response.data.data
}

// Download receipt PDF
export async function downloadReceiptPdf(receiptId: string): Promise<Blob> {
  const response = await client.get(`/finance/receipts/${receiptId}/pdf`, {
    responseType: 'blob'
  })
  return response.data
}
