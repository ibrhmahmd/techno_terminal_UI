/**
 * Common/shared types used across the academics API
 */

import type { PaginatedResponse } from "../../../types/pagination";

// Pagination re-export for convenience
export type { PaginatedResponse };

/**
 * Common enrollment history filters used in group lifecycle endpoints
 */
export interface EnrollmentHistoryFilters {
  level?: number;
  action?: 'enrolled' | 'transferred_in' | 'withdrawn' | 'transferred_out' | 'graduated';
  skip?: number;
  limit?: number;
}

/**
 * Generic paginated response for groups
 * @deprecated Use PaginatedResponse<T> from types/pagination directly
 */
export type PaginatedGroupsResponse<T = unknown> = PaginatedResponse<T>;
