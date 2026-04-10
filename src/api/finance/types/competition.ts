/**
 * Finance API Types - Competition Module
 * DTOs for competition fee management
 * @see docs/api/finance/competition.md
 */

export interface UnpaidCompFeeItem {
  id: number
  student_id: number
  competition_name: string
  competition_date: string
  fee_amount: number
  fee_type: 'registration' | 'materials' | 'transportation' | 'accommodation'
  is_paid: boolean
  due_date: string
}
