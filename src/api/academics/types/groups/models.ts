/**
 * Group-related type definitions
 * Aligned with API documentation: groups-api.md
 */

export interface Schedule {
  day: string;
  start_time: string;
  end_time: string;
}

/**
 * Input variant for POST/PATCH requests.
 * Backend expects `time_start`/`time_end` instead of `start_time`/`end_time`.
 */
export interface ScheduleInput {
  day: string;
  time_start: string;
  time_end: string;
}

// Base Group type (GroupPublic from API)
export interface Group {
  id: number;
  course_id: number;
  name: string;
  status: 'active' | 'inactive' | 'completed';
  capacity: number;
  current_level: number;
  instructor_id: number;
  schedule: Schedule;
  start_date: string;
}

// Simplified group list item (GroupListItem from API)
export interface GroupListItem {
  id: number;
  name: string;
  course_id: number;
  level_number: number;
  status: 'active' | 'inactive' | 'completed';
}

// Enriched group with related data
export interface EnrichedGroupPublic {
  id: number;
  name: string;
  course_name: string;
  instructor_name: string;
  status: 'active' | 'inactive' | 'completed';
  capacity: number;
  current_level: number;
  schedule?: Schedule;
  start_date?: string;
  notes?: string | null;
  students?: Array<{ id: number; full_name: string }>;
  current_student_count?: number;
  // Additional fields used by components
  course_id?: number;
  instructor_id?: number;
  level_number?: number;
}

// Raw enriched group from backend (may contain old field names)
export interface RawEnrichedGroupPublic extends EnrichedGroupPublic {
  group_name?: string;
  max_capacity?: number;
  default_day?: string;
  default_time_start?: string;
  default_time_end?: string;
  level_number?: number;
}

// Progress tracking for levels
export interface ProgressLevel {
  current_module: string;
  description: string;
  group_score: number;
  target_score: number;
  is_completed: boolean;
  ready_for_next_level: boolean;
}
