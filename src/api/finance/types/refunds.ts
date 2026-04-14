/**
 * Finance API Types - Refunds Module
 * DTOs for refund processing and risk assessment
 * @see docs/api/finance/refunds.md
 */

export interface RefundRequest {
  payment_id: number
  amount: number
  reason: string
  method: 'cash' | 'card' | 'transfer'
}

export interface RefundResult {
  refund_id: number
  payment_id: number
  amount: number
  method: string
  reason: string
  new_balance: number
  processed_at: string
}

export interface RiskAssessmentPublic {
  has_risk: boolean
  message?: string
  would_overpay: number
  current_balance: number
  projected_balance: number
}

// Backward compatibility alias
export type RiskAssessment = RiskAssessmentPublic
export type OverpaymentRisk = RiskAssessmentPublic
