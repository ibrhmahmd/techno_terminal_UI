/**
 * Finance Reporting API Types
 * Daily collection summaries and receipt listings
 * @see docs/api/finance/reporting.md
 */

export interface DailyCollectionItem {
  payment_method: string
  total_amount: number
  receipt_count: number
  target_date: string
}

export interface DailyReceiptItem {
  receipt_id: number
  receipt_number: string
  payer_name: string | null
  total_amount: number
  payment_method: string
  issued_at: string
}
