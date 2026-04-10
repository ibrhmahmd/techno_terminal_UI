/**
 * Finance API Types - Balance Module
 * DTOs for balance operations: inquiry, adjustments, credit
 * @see docs/api/finance/balance.md
 */

export interface CreditInfo {
  student_id: number
  credit_balance: number
  available_credit: number
  last_credit_date: string
}

export interface BalanceSummary {
  total_outstanding: number
  total_credit: number
  total_students_in_debt: number
  total_students_with_credit: number
  average_balance: number
}

export interface BalanceAdjustmentRequest {
  amount: number
  reason: string
  adjustment_type: 'credit' | 'debit' | 'waive'
}
