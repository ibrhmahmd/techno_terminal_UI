/**
 * Grouping-related types for Groups Page Enhancement
 * Server-side grouping
 */

import type { EnrichedGroupPublic } from "./models";

/**
 * Field to group groups by
 */
export type GroupByField = 'day' | 'course' | 'instructor' | 'status' | null;

/**
 * A single group of groups with metadata
 */
export interface GroupGroup {
  key: string;
  label: string;
  count: number;
  groups: EnrichedGroupPublic[];
}

/**
 * API response for grouped groups
 * GET /academics/groups/grouped
 */
export interface GroupedGroupsResponse {
  groups: GroupGroup[];
  total: number;
  groupBy: GroupByField;
}
