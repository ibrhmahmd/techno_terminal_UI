/**
 * Finance API Types - Barrel Export
 * @see docs/api/finance.md
 */

// Balance types
export type {
  BalanceSummary,
  BalanceAdjustmentRequest,
} from './balance'

// Receipt types
export type {
  // API-aligned types (new)
  ReceiptLineInput,
  ReceiptCreatedPublic,
  // Legacy/existing types
  ReceiptLineItem,
  ReceiptHeader,
  ReceiptDetail,
  ReceiptListItem,
  BatchGenerateRequest,
  // Legacy exports
  ReceiptItem,
  Receipt,
  CreateReceiptRequest,
  CreateReceiptResponse,
  ReceiptSearchParams,
} from './receipts'

// Refund types
export type {
  RefundRequest,
  RefundResult,
  RiskAssessment,
  // Legacy exports
  OverpaymentRisk,
} from './refunds'

// Competition types
export type {
  UnpaidCompFeeItem,
} from './competition'

// Reporting types
export type {
  DailyCollectionItem,
  DailyReceiptItem,
} from './reporting'
