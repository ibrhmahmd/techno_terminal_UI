/**
 * Finance API Types - Receipts Module
 * DTOs for receipt management: creation, generation, search
 * @see docs/api/finance/receipts.md
 */

export interface ReceiptLineItem {
  id: number
  student_id: number
  enrollment_id?: number
  team_member_id?: number
  amount: number
  transaction_type: 'charge' | 'credit' | 'refund'
  payment_type: 'course_level' | 'competition' | 'materials' | 'registration' | 'other'
  discount: number
  notes?: string
}

export interface ReceiptHeader {
  id: number
  receipt_number: string
  payer_name: string
  payment_method: 'cash' | 'card' | 'transfer' | 'other'
  paid_at: string
  notes?: string
}

export interface ReceiptDetail {
  header: ReceiptHeader
  lines: ReceiptLineItem[]
  total: number
}

export interface ReceiptListItem {
  id: number
  receipt_number: string
  payer_name: string
  payment_method: string
  paid_at: string
}

export interface BatchGenerateRequest {
  student_ids?: number[]
  date_from?: string
  date_to?: string
  payment_method?: string
}

// Legacy types (maintaining backward compatibility)
export interface ReceiptItem {
  enrollment_id?: number
  amount: number
  type: 'tuition' | 'materials' | 'registration' | 'other' | 'competition'
  description?: string
}

export interface Receipt {
  id: number
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
  student_id?: number
  payment_method: 'cash' | 'card' | 'transfer' | 'other'
  notes?: string
  items: ReceiptItem[]
}

export interface CreateReceiptResponse {
  success: boolean
  data: {
    id: number
    receipt_number: string
  }
}

export interface ReceiptSearchParams {
  from_date: string
  to_date: string
  payer_name?: string
  student_id?: number
  receipt_number?: string
}
