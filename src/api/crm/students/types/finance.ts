// Finance Types - Balance and enrollment finance data structures

export interface StudentBalance {
  student_id: number
  total_amount_due: number
  total_discounts: number
  total_paid: number
  net_balance: number
  enrollments: EnrollmentBalance[]
}

export interface EnrollmentBalance {
  enrollment_id: number
  group_id: number
  group_name: string
  level_number: number
  amount_due: number
  discount_applied: number
  total_paid: number
  remaining_balance: number
  status: string
  is_paid?: boolean
  total_refunded?: number
}

export interface BalanceAdjustmentResult {
  student_id: number
  previous_balance: number
  adjustment_amount: number
  new_balance: number
  reason: string
  adjustment_type: string
  adjusted_at: string
  adjusted_by: number
}

export interface UnpaidEnrollment {
  enrollment_id: number
  student_id: number
  student_name: string
  group_id: number
  group_name: string
  course_name: string
  level_number: number
  amount_due: number
  discount_applied: number
  total_paid: number
  remaining_balance: number
  enrolled_at: string
}
