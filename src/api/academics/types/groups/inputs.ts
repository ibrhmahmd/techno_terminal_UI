/**
 * Group-related input DTOs (Request types)
 * Aligned with API documentation: groups-api.md
 */

import type { ScheduleInput } from './models';

/**
 * Input for scheduling a new group
 * POST /academics/groups
 */
export interface ScheduleGroupInput {
  course_id: number;
  name: string;
  capacity: number;
  instructor_id: number;
  schedule: ScheduleInput;
  start_date: string;
}

/**
 * Input for updating a group
 * PATCH /academics/groups/{group_id}
 */
export interface UpdateGroupDTO {
  name?: string;
  capacity?: number;
  schedule?: ScheduleInput;
  instructor_id?: number;
  notes?: string;
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
