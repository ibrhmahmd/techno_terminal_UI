/**
 * Group lifecycle-related types
 * Level management, history, and enrollment tracking
 * Aligned with API documentation: docs/api/academics/group_lifecycle.md
 */

/**
 * Response from progressing group to a new level
 * Aligned with API: POST /academics/groups/{group_id}/progress-level
 */
export interface ProgressGroupLevelResult {
  old_level_number: number;
  new_level_number: number;
  enrollments_migrated: number;
  sessions_created: number;
  message: string;
}
