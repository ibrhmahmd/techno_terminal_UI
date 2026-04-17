/**
 * Finance API - Barrel Export
 * Main entry point for all finance API functions
 * 
 * @see docs/api/finance.md
 */

// Balance Operations
export {
  getStudentBalance,
  getEnrollmentBalance,
  getUnpaidEnrollments,
  adjustStudentBalance,
} from './balance'

// Receipt Management
export {
  createReceipt,
  searchReceipts,
  getReceiptDetails,
  downloadReceiptPdf,
  generateReceiptText,
  markReceiptAsSent,
  batchGenerateReceipts,
} from './receipts'

// Refunds & Credits
export {
  issueRefund,
  previewOverpaymentRisk,
  previewRefundRisk,
} from './refunds'

// Competition Fees
export {
  getUnpaidCompetitionFees,
} from './competition'

// Reporting
export {
  getDailyCollections,
  getDailyReceipts,
} from './reporting'

// Types
export type * from './types'
