/**
 * Group lifecycle-related types
 * Level management, history, and enrollment tracking
 * Aligned with API documentation: docs/api/academics/group_lifecycle.md
 */

/**
 * Group level history/snapshot record
 * Represents a level progression snapshot
 */
export interface GroupLevelHistoryDTO {
  price_override: number | null | undefined;
  id: number;
  level_number: number;
  level_name: string;
  start_date: string;
  end_date?: string;
  pricing_snapshot: {
    monthly_fee: number;
    session_fee: number;
    currency: string;
  };
  enrollment_count_start: number;
  enrollment_count_end?: number;
  sessions_count: number;
  completion_rate: number;
}

/**
 * Group level public response
 * From Group Lifecycle Router
 */
export interface GroupLevelPublic {
  id: number;
  group_id: number;
  level_number: number;
  course_id: number;
  course_name: string;
  instructor_id: number;
  instructor_name: string;
  sessions_planned: number;
  price_override: number | null;
  status: 'active' | 'completed' | 'cancelled';
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

/**
 * Enrollment history record for a student in a group
 */
export interface EnrollmentHistoryDTO {
  id: number;
  student_id: number;
  student_name: string;
  action: 'enrolled' | 'transferred_in' | 'withdrawn' | 'transferred_out' | 'graduated';
  date: string;
  level_at_time: number;
  notes?: string;
}

/**
 * Instructor assignment history record
 */
export interface InstructorAssignmentDTO {
  id: number;
  instructor_id: number;
  instructor_name: string;
  start_date: string;
  end_date?: string;
  assignment_type: 'primary' | 'substitute' | 'assistant';
  reason?: string;
}

/**
 * Input for creating a new group level
 */
export interface CreateNewLevelInput {
  level_number: number;
  pricing_snapshot: {
    monthly_fee: number;
    session_fee: number;
    currency: string;
  };
  notes?: string;
}

/**
 * @deprecated Use ProgressGroupLevelRequest from './inputs' instead.
 * The schedule-level endpoint has been replaced by progress-level.
 */
export interface ScheduleGroupLevelInput {
  level_number: number;
  instructor_id: number;
  price_override?: number | null;
  start_date: string;
}

/**
 * @deprecated Use ProgressGroupLevelResult instead.
 * The schedule-level endpoint has been replaced by progress-level.
 */
export interface ScheduleGroupLevelResponse {
  level_id: number;
  level_number: number;
  group_id: number;
  sessions_created: number;
  sessions: Array<{
    id: number;
    session_number: number;
    date: string;
  }>;
}

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

/**
 * Student attendance record for a session
 */
export interface StudentAttendance {
  student_id: string;
  student_name: string;
  billing_status: "paid" | "due";
  attendance: (boolean | null)[];
  notes?: string;
}

/**
 * Full group lifecycle history response
 * GET /academics/groups/{group_id}/history
 */
export interface GroupLifecycleHistoryDTO {
  group_id: number;
  group_name: string;
  created_at: string;
  current_level: number;
  total_levels: number;
  completed_levels: number;
  levels_timeline: GroupLevelTimelineItem[];
  course_assignments: CourseAssignmentDTO[];
  enrollment_transitions: EnrollmentTransitionDTO[];
}

export interface GroupLevelTimelineItem {
  id: number;
  level_number: number;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  course_name: string;
  instructor_name: string;
  enrollment_count: number;
}

/**
 * Response from completing a level
 * POST /academics/groups/{group_id}/levels/{level_number}/complete
 */
export interface CompleteLevelResponse {
  completed_level: {
    id: number;
    level_number: number;
    status: string;
  };
  new_level: {
    id: number;
    level_number: number;
    status: string;
  };
}

/**
 * Response from cancelling a level
 * POST /academics/groups/{group_id}/levels/{level_number}/cancel
 */
export interface CancelLevelResponse {
  level_id: number;
  level_number: number;
  status: 'cancelled';
}

/**
 * Course assignment history record
 * GET /academics/groups/{group_id}/courses/history
 */
export interface CourseAssignmentDTO {
  course_id: number;
  course_name: string;
  assigned_at: string;
  removed_at?: string;
  assigned_by_user_id?: number;
  notes?: string;
}

/**
 * Enrollment transition record
 * GET /academics/groups/{group_id}/enrollments/history
 */
export interface EnrollmentTransitionDTO {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  group_level_id: number;
  level_number: number;
  level_entered_at: string;
  level_completed_at?: string;
  status: 'active' | 'completed' | 'dropped';
}

/**
 * Level analytics data
 * GET /academics/groups/{group_id}/levels/analytics
 */
export interface GroupLevelAnalyticsDTO {
  level_id: number;
  level_number: number;
  student_count: number;
  sessions_completed: number;
  sessions_total: number;
  completion_rate: number;
  average_attendance: number;
}

/**
 * Enrollment analytics data
 * GET /academics/groups/{group_id}/enrollments/analytics
 */
export interface GroupEnrollmentAnalyticsDTO {
  group_id: number;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  dropped_enrollments: number;
  students_by_level: Array<{
    level_number: number;
    student_count: number;
  }>;
  recent_transitions: EnrollmentTransitionDTO[];
}

/**
 * Filters for enrollment analytics
 */
export interface AnalyticsFilters {
  status?: 'active' | 'completed' | 'dropped';
  skip?: number;
  limit?: number;
}
