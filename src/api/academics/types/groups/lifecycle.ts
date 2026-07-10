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

export interface UpdateLevelInput {
  instructor_id?: number | null;
  course_id?: number | null;
  price_override?: number | null;
  notes?: string | null;
}

export interface DeleteLevelResponse {
  group_id: number;
  level_number_deleted: number;
  reverted_to_level: number | null;
  group_level_number_after: number | null;
}

export interface CancelLevelResult {
  level_id: number;
  level_number: number;
  status: 'cancelled';
  cancelled_at: string;
  reason: string;
}

export interface GroupLevelPublic {
  id: number;
  group_id: number;
  level_number: number;
  course_id?: number | null;
  course_name?: string | null;
  instructor_id?: number | null;
  instructor_name?: string | null;
  sessions_planned: number;
  price_override?: number | null;
  status: string;
  effective_from?: string | null;
  effective_to?: string | null;
  notes?: string | null;
  created_at: string;
}
