/**
 * Session-related input DTOs (Request types)
 * Aligned with API documentation: docs/api/academics/sessions.md
 */

/**
 * Input for updating a session
 * PATCH /academics/sessions/{session_id}
 */
export interface UpdateSessionDTO {
  session_date?: string;
  start_time?: string;
  end_time?: string;
  actual_instructor_id?: number;
  is_substitute?: boolean;
  status?: "scheduled" | "completed" | "cancelled";
  notes?: string | null;
}

/**
 * Input for adding an extra session
 * POST /academics/groups/{group_id}/sessions
 */
export interface AddExtraSessionInput {
  group_id: number;
  level_number: number;
  extra_date: string;
  notes?: string | null;
}

/**
 * Input for marking substitute instructor
 * POST /academics/sessions/{session_id}/substitute
 */
export interface SubstituteInstructorRequest {
  instructor_id: number;
}
