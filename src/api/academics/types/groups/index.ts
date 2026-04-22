/**
 * Groups types barrel export
 * Re-exports all group-related types from modular files
 */

// Group models
export type {
  Group,
  GroupListItem,
  EnrichedGroupPublic,
  ProgressLevel,
} from './models';

// Group input DTOs
export type {
  ScheduleGroupInput,
  UpdateGroupDTO,
  GenerateLevelSessionsRequest,
  /** @deprecated Use ProgressGroupLevelRequest instead */
  ScheduleGroupLevelRequest,
  ProgressGroupLevelRequest,
  CancelLevelInput,
} from './inputs';

// Grouping types
export type {
  GroupByField,
  GroupGroup,
  GroupedGroupsResponse,
  EnrichedGroupPublicWithCompetition,
} from './grouping';

// Lifecycle types
export type {
  GroupLevelHistoryDTO,
  GroupLevelPublic,
  EnrollmentHistoryDTO,
  InstructorAssignmentDTO,
  StudentAttendance,
  CreateNewLevelInput,
  /** @deprecated Use ProgressGroupLevelRequest instead */
  ScheduleGroupLevelInput,
  /** @deprecated Use ProgressGroupLevelResult instead */
  ScheduleGroupLevelResponse,
  ProgressGroupLevelResult,
  GroupLifecycleHistoryDTO,
  GroupLevelTimelineItem,
  CompleteLevelResponse,
  CancelLevelResponse,
  CourseAssignmentDTO,
  EnrollmentTransitionDTO,
  GroupLevelAnalyticsDTO,
  GroupEnrollmentAnalyticsDTO,
  AnalyticsFilters,
} from './lifecycle';

// Competition types
export type {
  CompetitionParticipationDTO,
  TeamPublic,
  PaginatedTeamResponse,
  TeamMemberPublic,
  GroupCompetitionHistoryResponseDTO,
  LinkTeamResponse,
  CompetitionRegistrationResponse,
  CompleteParticipationResponse,
  WithdrawParticipationResponse,
} from './competitions';
