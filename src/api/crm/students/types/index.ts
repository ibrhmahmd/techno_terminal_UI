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
  type ActivityLogRequest,
  type ManualActivityResponseDTO,
  type RecentActivityItemDTO,
  type ActivitySearchParams,
  type ActivitySearchResultItemDTO,
} from './activity'
