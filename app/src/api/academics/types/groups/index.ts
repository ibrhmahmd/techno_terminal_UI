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
} from './lifecycle';

// Competition types
export type {
  CompetitionParticipationDTO,
  TeamPublic,
  PaginatedTeamResponse,
  TeamMemberPublic,
  GroupCompetitionHistoryResponseDTO,
} from './competitions';
