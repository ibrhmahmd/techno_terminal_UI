/**
 * Group-related input DTOs (Request types)
 * Aligned with API documentation: docs/api/academics/groups.md
 */

/**
 * Input for scheduling a new group
 * POST /academics/groups
 */
export interface ScheduleGroupInput {
  course_id: number;
  instructor_id: number;
  default_day: string;
  default_time_start: string;
  default_time_end: string;
  max_capacity?: number;
  notes?: string;
}

/**
 * Input for updating a group
 * PATCH /academics/groups/{group_id}
 */
export interface UpdateGroupDTO extends Partial<ScheduleGroupInput> {
  name?: string;
  level_number?: number;
  status?: string;
}

/**
 * Input for generating level sessions
 * POST /academics/groups/{group_id}/generate-sessions
 */
export interface GenerateLevelSessionsRequest {
  level_number: number;
  start_date?: string; // YYYY-MM-DD
}

/**
 * @deprecated Use ProgressGroupLevelRequest with target_level instead.
 * The schedule-level endpoint has been replaced by progress-level.
 */
export interface ScheduleGroupLevelRequest {
  level_number: number;
  instructor_id?: number;
  price_override?: number;
  start_date?: string;
}

/**
 * Input for progressing group to next level
 * POST /academics/groups/{group_id}/progress-level
 */
export interface ProgressGroupLevelRequest {
  price_override?: number;
  /** Target level number (defaults to current + 1 if not provided) */
  target_level?: number;
  /** Whether to auto-migrate enrollments (user chooses) */
  auto_migrate_enrollments?: boolean;
  /** Whether to complete the current level (user chooses) */
  complete_current_level?: boolean;
  /** Override instructor ID */
  instructor_id?: number;
  /** Session start date in YYYY-MM-DD format */
  session_start_date?: string;
  /** Override course ID */
  course_id?: number;
  /** Override group name (max 255 chars) */
  group_name?: string;
}

/**
 * Input for cancelling a level
 * POST /academics/groups/{group_id}/levels/{level_id}/cancel
 */
export interface CancelLevelInput {
  reason?: string;
}
