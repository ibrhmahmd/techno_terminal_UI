/**
 * Groups API - Barrel Export
 * Main entry point for all group-related API functions
 * 
 * Usage:
 *   import { 
 *     getGroups, 
 *     createGroup, 
 *     getGroupLevels,
 *     getGroupCompetitions 
 *   } from '../api/academics/groups'
 */

// Core router functions
export {
  getGroupDetails,
  getGroups,
  getGroupsPaginated,
  getEnrichedGroups,
  getEnrichedGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  archiveGroup,
  progressGroupLevel,
  /** @deprecated Use progressGroupLevel instead */
  levelUpGroup,
  listSessionsForGroup,
  getGroupsGrouped,
} from './core';

// Lifecycle router functions
export {
  generateLevelSessions,
  getGroupLevels,
  getGroupEnrollmentHistory,
  getGroupInstructorHistory,
  createNewLevel,
  /** @deprecated Use progressGroupLevel instead */
  scheduleGroupLevel,
  getGroupLifecycleHistory,
  getGroupLevel,
  completeGroupLevel,
  cancelGroupLevel,
  getGroupCourseHistory,
  getGroupEnrollmentTransitions,
  getGroupLevelAnalytics,
  getGroupEnrollmentAnalytics,
} from './lifecycle';

// Competitions router functions
export {
  getGroupCompetitions,
  getGroupTeams,
  linkTeamToGroup,
  registerForCompetition,
  completeCompetitionParticipation,
  withdrawFromCompetition,
  getGroupCompetitionAnalytics,
} from './competitions';

// Utility functions
export {
  getGroupsWithCompetitions,
} from './utils';
