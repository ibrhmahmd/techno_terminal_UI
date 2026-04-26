/**
 * Analytics API - Barrel Export
 * Main entry point for all analytics API functions
 * 
 * @see docs/api/analytics.md
 */

// Academic module
export {
  getUnpaidAttendees,
  getGroupRoster,
  getAttendanceHeatmap,
  getStudentProgress,
  getCourseCompletion,
} from './academic'

// BI module
export {
  getEnrollmentTrends,
  getInstructorPerformance,
  getRetentionMetrics,
  getRetentionFunnel,
  getInstructorValueMatrix,
  getScheduleUtilization,
  getFlightRiskStudents,
  getRetentionAnalysis,
} from './bi'

// Competition module
export { getCompetitionFeeSummary } from './competition'

// Financial module
export {
  getRevenueByDate,
  getRevenueByMethod,
  getOutstandingByGroup,
  getTopDebtors,
  getRevenueMetrics,
  getRevenueForecast,
} from './financial'

// Types
export type * from './types'
