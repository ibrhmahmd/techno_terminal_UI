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

// API-Aligned Types (matches finance-API-doc.md)
export interface ReceiptLinePublic {
  id: number                   // REQUIRED: Line identifier (sequential)
  student_id: number           // REQUIRED: Student ID for this line
  enrollment_id?: number       // Optional enrollment ID
  amount: number               // Payment amount (positive number)
  transaction_type: 'charge' | 'credit' | 'refund' | string  // REQUIRED: Transaction classification
  payment_type: 'course_level' | 'competition' | 'materials' | 'registration' | 'other'
  discount?: number            // Discount amount (default: 0)
  notes?: string               // Line item notes (optional)
}

// Backward compatibility alias
export type ReceiptLineInput = ReceiptLinePublic

export interface CreateReceiptRequest {
  payer_name: string           // REQUIRED: Who is paying
  method: 'cash' | 'card' | 'transfer' | 'other'  // Payment method
  notes?: string               // General receipt notes
  lines: ReceiptLinePublic[]   // Payment line items (REQUIRED, min 1)
  allow_credit?: boolean       // Allow overpayment/credit (default: true)
}

// Response DTOs from API
export interface ReceiptCreatedPublic {
  receipt_id: number
  receipt_number: string
  payment_method: string
  paid_at: string
  lines: number
  total: number
  payment_ids: number[]
}

// Legacy types (deprecated - use ReceiptLineInput instead)
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
