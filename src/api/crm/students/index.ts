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
export type {
  // Models
  Student,
  StudentStatus,
  StudentWithDetails,
  Parent,
  EnrollmentInfo,
  StudentBalanceSummary,
  SiblingInfo,
  StudentStatusSummary,
  // Inputs
  CreateStudentDTO,
  UpdateStudentDTO,
  UpdateStudentStatusDTO,
  SetWaitingPriorityDTO,
  LinkSiblingDTO,
  BalanceAdjustmentDTO,
  // Finance
  StudentBalance,
  EnrollmentBalance,
  BalanceAdjustmentResult,
  UnpaidEnrollment,
  // History
  StatusHistoryRecord,
  AttendanceHistoryRecord,
} from './types'

// Additional type exports from search
export type { StudentSearchFilters } from './search'
