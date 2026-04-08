/**
 * Group-related type definitions
 * Aligned with API documentation: docs/api/academics/groups.md
 */

// Base Group type (GroupPublic from API)
export interface Group {
  id: number;
  group_name: string;
  course_id: number;
  instructor_id: number;
  level_number: number;
  max_capacity: number;
  default_day: string;
  default_time_start: string;
  default_time_end: string;
  is_active: boolean;
}

// Simplified group list item (GroupListItem from API)
export interface GroupListItem {
  id: number;
  name: string;
  course_id: number;
  level_number: number;
  default_day: string;
  default_time_start: string;
  status?: string;
  is_active: boolean;
}

// Enriched group with related data
export interface EnrichedGroupPublic extends Group {
  course_name: string;
  group_name: string;
  instructor_name: string; 
  schedule_time?: string;
  notes?: string | null;  // Added for editable group notes
  status: 'active' | 'inactive' | 'archived';  
  students?: Array<{ id: number; full_name: string }>;
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
