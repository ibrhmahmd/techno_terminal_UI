/**
 * Grouping-related types for Groups Page Enhancement
 * Server-side grouping and client-side competition grouping
 */

import type { EnrichedGroupPublic } from "./models";
import type { CompetitionParticipationDTO } from "./competitions";

/**
 * Field to group groups by
 * 'competition' is handled client-side, others are server-side
 */
export type GroupByField = 'day' | 'course' | 'instructor' | 'status' | 'competition' | null;

/**
 * A single group of groups with metadata
 */
export interface GroupGroup {
  key: string; // Group identifier (e.g., "monday", "Course A")
  label: string; // Display label
  count: number; // Number of groups in this group
  groups: EnrichedGroupPublic[]; // Groups in this group
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

/**
 * Extended EnrichedGroupPublic with competition data
 * Used for client-side competition grouping
 */
export interface EnrichedGroupPublicWithCompetition extends EnrichedGroupPublic {
  competitions?: CompetitionParticipationDTO[]; // Fetched separately
  is_in_competition?: boolean;
}
