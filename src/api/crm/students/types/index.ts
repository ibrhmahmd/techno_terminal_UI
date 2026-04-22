// Re-export all student types

// Models
export {
  type Student,
  type StudentStatus,
  type StudentWithDetails,
  type StudentListItem,
  type Parent,
  type ParentInfo,
  type ParentListItem,
  type EnrollmentInfo,
  type CurrentEnrollmentInfo,
  type StudentBalanceSummary,
  type SiblingInfo,
  type StudentStatusSummary,
  type AttendanceStatsDTO,
  type SessionAttendanceItem,
  type StudentEnrollmentAttendanceItem,
  type CourseRecord,
  type CompetitionRecord,
  type TeamRecord,
  type StudentFilterItem,
  type StudentFilterResult,
} from './models'

// Inputs/DTOs
export {
  type CreateStudentDTO,
  type UpdateStudentDTO,
  type UpdateStudentStatusDTO,
  type SetWaitingPriorityDTO,
  type LinkSiblingDTO,
  type BalanceAdjustmentDTO,
  type ParentCreate,
  type ParentUpdate,
} from './inputs'

// Finance
export {
  type StudentBalance,
  type EnrollmentBalance,
  type BalanceAdjustmentResult,
  type UnpaidEnrollment,
} from './finance'

// History
export {
  type StatusHistoryEntry,
  type StatusHistoryRecord,
  type AttendanceHistoryRecord,
} from './history'

// Activity
export {
  type ActivityType,
  type ReferenceType,
  type ActivityLogResponseDTO,
  type ActivitySummaryItem,
  type EnrollmentHistoryEntry,
  type CompetitionHistoryEntry,
  type ActivityLogRequest,
  type ManualActivityResponseDTO,
  type RecentActivityItemDTO,
  type ActivitySearchParams,
  type ActivitySearchResultItemDTO,
} from './activity'

// Payments
export {
  type TransactionType,
  type PaymentListItem,
  type ReceiptInfo,
  type PaymentEnrollmentInfo,
  type StudentSnapshot,
  type PaymentParentInfo,
  type PaymentDetailsResponse,
  type StudentPaymentsListResponse,
  type SendReceiptRequest,
  type SendReceiptResponse,
} from './payments'
