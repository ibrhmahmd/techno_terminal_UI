// Student API Module - Re-exports
// Refactored structure following groups API pattern

// Core CRUD
export {
  getStudentsPaginated,
  getStudentById,
  getStudentWithDetails,
  createStudent,
  updateStudent,
  deleteStudent,
  getParentById,
  getStudentParents,
} from './core'

// Finance
export {
  getStudentBalance,
  getEnrollmentBalance,
  getUnpaidEnrollments,
  adjustStudentBalance,
} from './finance'

// Status
export {
  updateStudentStatus,
  setWaitingPriority,
  getStudentStatusSummary,
  getStudentsByStatus,
} from './status'

// History
export {
  getStatusHistory,
  getAttendanceHistory,
} from './history'

// Activity
export {
  getStudentActivityHistory,
  getActivitySummary,
  getEnrollmentHistory,
  getCompetitionHistory,
  logActivity,
  getRecentActivities,
  searchActivities,
  type PaginatedEnrollmentHistory,
  type PaginatedCompetitionHistory,
} from './activity'

// Siblings
export {
  getStudentSiblings,
  linkSibling,
  unlinkSibling,
} from './siblings'

// Enrollments (Lazy-loaded per-enrollment data - TODO: Backend endpoints)
export {
  getStudentCourses,
  getStudentCompetitions,
  getStudentTeams,
} from './enrollments'

// Search
export {
  searchStudents,
  searchStudentsAdvanced,
  getStudentsGrouped,
  type StudentGroupedResultDTO,
  type StudentGroup,
} from './search'

// Utils
export {
  calculateAge,
  formatStudentDisplay,
  hasOutstandingBalance,
  getBalanceDisplay,
  getStatusColorClass,
  getStatusLabel,
} from './utils'

// Types
export {
  // Models
  type Student,
  type StudentListItem,
  type StudentStatus,
  type StudentWithDetails,
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
  // Inputs
  type CreateStudentDTO,
  type UpdateStudentDTO,
  type UpdateStudentStatusDTO,
  type SetWaitingPriorityDTO,
  type LinkSiblingDTO,
  type BalanceAdjustmentDTO,
  type ParentCreate,
  type ParentUpdate,
  // Finance
  type StudentBalance,
  type EnrollmentBalance,
  type BalanceAdjustmentResult,
  type UnpaidEnrollment,
  // History
  type StatusHistoryEntry,
  type StatusHistoryRecord,
  type AttendanceHistoryRecord,
  // Activity
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
} from './types'

// Additional type exports from search
export type { StudentSearchFilters } from './search'
