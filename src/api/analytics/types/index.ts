/**
 * Analytics API Types - Barrel Export
 * @see docs/api/analytics.md
 */

// Academic types
export type {
  DashboardSummaryPublic,
  SessionSummaryPublic,
  UnpaidAttendeeDTO,
  GroupRosterRowDTO,
  AttendanceHeatmapRowDTO,
  StudentProgressDTO,
  CourseCompletionDTO,
} from './academic'

// BI types
export type {
  EnrollmentTrendDTO,
  InstructorPerformanceDTO,
  RetentionMetricsDTO,
  LevelRetentionFunnelDTO,
  InstructorValueMatrixDTO,
  ScheduleUtilizationDTO,
  FlightRiskStudentDTO,
  UserEngagementDTO,
  RetentionAnalysisDTO,
} from './bi'

// Competition types
export type {
  CompetitionFeeSummaryDTO,
} from './competition'

// Financial types
export type {
  RevenueByDateDTO,
  RevenueByMethodDTO,
  OutstandingByGroupDTO,
  TopDebtorDTO,
  RevenueMetricsDTO,
  RevenueForecastDTO,
} from './financial'
