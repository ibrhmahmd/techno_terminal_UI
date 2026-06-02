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
  payment_method: 'cash' | 'e_wallet' | 'instapay' | 'other'
  paid_at: string
  notes?: string
}

export interface ReceiptDetail {
  receipt: ReceiptHeader
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
  receipt_ids: number[]
  template_name?: 'standard' | 'detailed'
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
  payer_name?: string | null   // Optional, default null
  method?: 'cash' | 'e_wallet' | 'instapay' | 'other'  // Optional, default "cash"
  notes?: string | null        // General receipt notes
  allow_credit?: boolean      // Optional, default true
  lines: ReceiptLinePublic[]   // REQUIRED: Payment line items (min 1)
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
  payment_method: 'cash' | 'e_wallet' | 'instapay' | 'other'
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
