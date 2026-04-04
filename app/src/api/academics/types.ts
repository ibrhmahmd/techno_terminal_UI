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
  instructor_name: string;
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
