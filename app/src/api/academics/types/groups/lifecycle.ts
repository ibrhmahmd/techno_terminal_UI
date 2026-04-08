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
 * Student attendance record for a session
 */
export interface StudentAttendance {
  student_id: string;
  student_name: string;
  billing_status: "paid" | "due";
  attendance: (boolean | null)[];
  notes?: string;
}
