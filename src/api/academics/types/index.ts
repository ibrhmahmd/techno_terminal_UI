/**
 * Academics API types barrel export
 * Main entry point for all academics-related types
 * 
 * Usage:
 *   import { Group, Session, Course } from '../api/academics/types'
 *   import type { EnrichedGroupPublic } from '../api/academics/types'
 */

// Common/shared types
export type {
  PaginatedGroupsResponse,
  EnrollmentHistoryFilters,
} from './common';

// Re-export from sub-modules
export * from './groups';
export * from './sessions';
export * from './courses';
