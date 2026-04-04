export interface ReceiptItem {
  enrollment_id: number
  amount: number
  type: 'tuition' | 'materials' | 'registration' | 'other'
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

export interface StudentBalance {
  student_id: number
  student_name: string
  total_due: number
  total_paid: number
  balance: number
  enrollments_balance: {
    enrollment_id: number
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
