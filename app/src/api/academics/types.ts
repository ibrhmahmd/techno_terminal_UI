import type { PaginatedResponse } from "../../types/pagination";

// GroupPublic from API docs
export interface Group {
  id: number;
  name: string;
  course_id: number;
  instructor_id: number;
  level_number: number;
  max_capacity: number;
  default_day: string;
  default_time_start: string;
  default_time_end: string;
  is_active: boolean;
}

export interface EnrichedGroupPublic extends Group {
  course_name: string;
  group_name: string;
  instructor_name: string;
  schedule_time?: string;
  students?: Array<{ id: number; full_name: string }>;
}

export interface Session {
  id: number;
  group_id: number;
  level_number: number;
  session_number: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  is_extra_session: boolean;
  actual_instructor_id: number;
  instructor_name?: string;  // Populated by backend for display purposes
  notes: string;
}

export interface ProgressLevel {
  current_module: string;
  description: string;
  group_score: number;
  target_score: number;
  is_completed: boolean;
  ready_for_next_level: boolean;
}

export interface StudentAttendance {
  student_id: string;
  student_name: string;
  billing_status: "paid" | "due";
  attendance: (boolean | null)[];
  notes?: string;
}

export interface DailyScheduleItem {
  session_id: number;
  date: string;
  time_start: string;
  time_end: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  group_id: number;
  group_name: string;
  level_number: number;
  course_id: number;
  course_name: string;
  enrolled_count: number;
}

export interface UpdateSessionDTO {
  session_date?: string;
  start_time?: string;
  end_time?: string;
  actual_instructor_id?: number;
  is_substitute?: boolean;
  status?: "scheduled" | "completed" | "cancelled";
  notes?: string | null;
}

export interface AddExtraSessionInput {
  group_id: number;
  level_number: number;
  extra_date: string;
  notes?: string | null;
}

// Request DTO for marking substitute instructor (aligns with API docs)
export interface SubstituteInstructorRequest {
  instructor_id: number;
}

export interface ScheduleGroupInput {
  course_id: number;
  instructor_id: number;
  default_day: string;
  default_time_start: string;
  default_time_end: string;
  max_capacity?: number;
  notes?: string;
}

export interface UpdateGroupDTO extends Partial<ScheduleGroupInput> {
  name?: string;
  level_number?: number;
  status?: string;
}

export interface Course {
  id: number;
  name: string;
  category?: string;
  description?: string;
  price_per_level?: number;
  sessions_per_level?: number;
  is_active: boolean;
}

export interface AddNewCourseInput {
  name: string;
  category?: string;
  description?: string;
  notes?: string;
  price_per_level: number;
  sessions_per_level: number;
}

export interface UpdateCourseDTO extends Partial<AddNewCourseInput> {
  is_active?: boolean;
}

export type PaginatedGroupsResponse = PaginatedResponse<Group>;

export interface CourseStats {
  course_id: number;
  course_name: string;
  total_groups: number;
  active_groups: number;
  total_students_ever: number;
  active_students: number;
}

// New DTOs for Group Details Page

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

export interface EnrollmentHistoryDTO {
  id: number;
  student_id: number;
  student_name: string;
  action: 'enrolled' | 'transferred_in' | 'withdrawn' | 'transferred_out' | 'graduated';
  date: string;
  level_at_time: number;
  notes?: string;
}

export interface CompetitionParticipationDTO {
  id: number;
  
  competition_id: number;
  competition_name: string;
  level_at_time: number;
  event_date: string;
  result?: 'winner' | 'runner_up' | 'participant' | 'disqualified';
  score?: number;
  notes?: string;
}

export interface InstructorAssignmentDTO {
  id: number;
  instructor_id: number;
  instructor_name: string;
  start_date: string;
  end_date?: string;
  assignment_type: 'primary' | 'substitute' | 'assistant';
  reason?: string;
}

export interface EnrollmentHistoryFilters {
  level?: number;
  action?: EnrollmentHistoryDTO['action'];
  skip?: number;
  limit?: number;
}

// Grouping Types for Groups Page Enhancement

/** Field to group groups by */
export type GroupByField = 'day' | 'course' | 'instructor' | 'status' | 'competition' | null;

/** A single group of groups with metadata */
export interface GroupGroup {
  key: string; // Group identifier (e.g., "monday", "Course A")
  label: string; // Display label
  count: number; // Number of groups in this group
  groups: EnrichedGroupPublic[]; // Groups in this group
}

/** API response for grouped groups */
export interface GroupedGroupsResponse {
  groups: GroupGroup[];
  total: number;
  groupBy: GroupByField;
}

/** Extended EnrichedGroupPublic with competition data for competition grouping */
export interface EnrichedGroupPublicWithCompetition extends EnrichedGroupPublic {
  competitions?: CompetitionParticipationDTO[]; // Fetched separately
  is_in_competition?: boolean;
}
