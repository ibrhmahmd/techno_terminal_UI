/**
 * Groups API - Barrel Export
 * Main entry point for all group-related API functions
 * 
 * Usage:
 *   import { 
 *     getGroups, 
 *     createGroup, 
 *     getDetailedLevels,
 *     searchGroups,
 *     getArchivedGroups
 *   } from '../api/academics/groups'
 */

// Core router functions
export {
  getGroupsPaginated,
  getEnrichedGroups,
  getEnrichedGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  archiveGroup,
  progressGroupLevel,
  listSessionsForGroup,
  getGroupsGrouped,
  getGroupsByCourse,
  type GroupFilterOptions,
} from './core';

// Lifecycle router functions
export {
  generateLevelSessions,
} from './lifecycle';

// New endpoints (Group Details API v2)
export {
  getDetailedLevels,
  getAttendanceForLevel,
  getGroupPayments,
  getGroupEnrollmentsAll,
  // Types
  type DetailedLevelsResponse,
  type LevelDetailDTO,
  type CourseInfoDTO,
  type InstructorInfoDTO,
  type LevelSessionDTO,
  type LevelPaymentSummaryDTO,
  type AttendanceLevelResponse,
  type AttendanceRosterDTO,
  type AttendanceSessionDTO,
  type GroupPaymentsResponse,
  type PaymentDetailDTO,
  type LevelPaymentsDTO,
  type GroupPaymentsSummaryDTO,
  type GroupEnrollmentsAllResponse,
  type EnrollmentStudentDTO,
  type EnrollmentDetailDTO,
  type EnrollmentSummaryDTO,
  type LevelEnrollmentGroupDTO,
  type TransferOptionDTO,
} from './newEndpoints';
