/**
 * Finance API Types - Balance Module
 * DTOs for balance operations: inquiry, adjustments, credit
 * @see docs/api/finance/balance.md
 */

export interface CreditInfoPublic {
  student_id: number
  credit_balance: number
  available_credit: number
  last_credit_date: string
}

// Backward compatibility alias
export type CreditInfo = CreditInfoPublic

export interface BalanceSummaryPublic {
  total_outstanding: number
  total_credit: number
  total_students_in_debt: number
  total_students_with_credit: number
  average_balance: number
}

// Backward compatibility alias
export type BalanceSummary = BalanceSummaryPublic

export interface BalanceAdjustmentRequest {
  amount: number
  reason: string
  adjustment_type: 'credit' | 'debit' | 'waive'
}
