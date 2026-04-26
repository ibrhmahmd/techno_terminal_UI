/**
 * Session-related type definitions
 * Aligned with API documentation: docs/api/academics/sessions.md
 */

/**
 * Session model (SessionPublic from API)
 */
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
  instructor_name?: string; // Populated by backend for display purposes
  is_substitute?: boolean;
  notes: string;
}
