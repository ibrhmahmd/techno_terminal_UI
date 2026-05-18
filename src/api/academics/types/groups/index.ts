/**
 * Groups types barrel export
 * Re-exports all group-related types from modular files
 */

// Group models
export type {
  Group,
  GroupListItem,
  EnrichedGroupPublic,
  RawEnrichedGroupPublic,
  ProgressLevel,
  Schedule,
  ScheduleInput,
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
