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

// Siblings
export {
  getStudentSiblings,
  linkSibling,
  unlinkSibling,
} from './siblings'

// Search
export {
  searchStudents,
  searchStudentsAdvanced,
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
  type StudentStatus,
  type StudentWithDetails,
  type Parent,
  type EnrollmentInfo,
  type StudentBalanceSummary,
  type SiblingInfo,
  type StudentStatusSummary,
  // Inputs
  type CreateStudentDTO,
  type UpdateStudentDTO,
  type UpdateStudentStatusDTO,
  type SetWaitingPriorityDTO,
  type LinkSiblingDTO,
  type BalanceAdjustmentDTO,
  // Finance
  type StudentBalance,
  type EnrollmentBalance,
  type BalanceAdjustmentResult,
  type UnpaidEnrollment,
  // History
  type StatusHistoryRecord,
  type AttendanceHistoryRecord,
} from './types'

// Additional type exports from search
export type { StudentSearchFilters } from './search'
