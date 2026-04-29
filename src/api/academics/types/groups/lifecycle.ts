/**
 * Group lifecycle-related types
 * Level management, history, and enrollment tracking
 * Aligned with API documentation: docs/api/academics/group_lifecycle.md
 */

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
  recent_transitions: Array<{
    enrollment_id: number;
    student_id: number;
    student_name: string;
    level_number: number;
    status: 'active' | 'completed' | 'dropped';
  }>;
}

/**
 * Filters for enrollment analytics
 */
export interface AnalyticsFilters {
  status?: 'active' | 'completed' | 'dropped';
  skip?: number;
  limit?: number;
}
