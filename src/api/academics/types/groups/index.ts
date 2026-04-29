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
  GroupLevelPublic,
  EnrollmentHistoryDTO,
  InstructorAssignmentDTO,
  CreateNewLevelInput,
  ProgressGroupLevelResult,
  CompleteLevelResponse,
  CancelLevelResponse,
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
