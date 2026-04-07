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
} from './lifecycle';

// Competitions router functions
export {
  getGroupCompetitions,
  getGroupTeams,
} from './competitions';

// Utility functions
export {
  getGroupsWithCompetitions,
} from './utils';
