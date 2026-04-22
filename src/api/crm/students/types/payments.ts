// Student Payments Types - CRM Student Payment Tracking

export type TransactionType = 'payment' | 'refund' | 'adjustment'

export interface PaymentListItem {
  id: number
  student_id: number
  amount: number
  payment_date: string
  payment_method: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  receipt_id: number
  receipt_number: string
  course_name: string | null
  group_name: string | null
  level_number: number | null
  transaction_type: TransactionType
}

// Receipt information nested in payment details
export interface ReceiptInfo {
  receipt_id: number
  receipt_number: string | null
  issued_date: string | null
  payment_method: string | null
  issued_by: string | null
  notes: string | null
}

// Enrollment information nested in payment details (payment-specific variant)
export interface PaymentEnrollmentInfo {
  enrollment_id: number | null
  group_id: number | null
  group_name: string | null
  course_name: string | null
  level_number: number | null
  instructor_id: number | null
  instructor_name: string | null
}

// Student snapshot in payment details
export interface StudentSnapshot {
  full_name: string
  phone: string | null
}

// Parent contact information in payment details (payment-specific variant)
export interface PaymentParentInfo {
  parent_id: number | null
  full_name: string | null
  phone: string | null
}

// Full payment details response (not extending PaymentListItem - separate structure)
export interface PaymentDetailsResponse {
  id: number
  student_id: number
  amount: number
  payment_type: string | null
  transaction_type: TransactionType
  discount_amount: number
  notes: string | null
  created_at: string | null
  receipt: ReceiptInfo
  enrollment: PaymentEnrollmentInfo
  student: StudentSnapshot
  parent: PaymentParentInfo
}

// Pagination response for list endpoint
export interface StudentPaymentsListResponse {
  data: PaymentListItem[]
  total: number
  skip: number
  limit: number
}

export interface SendReceiptRequest {
  method: 'whatsapp' | 'email'
}

export interface SendReceiptResponse {
  success: boolean
  message: string
  receipt_id: number
  recipient_contact: string | null
  sent_at: string
}
