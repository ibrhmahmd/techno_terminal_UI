/**
 * Sessions API - Core Router Functions
 * Sessions Router: docs/api/academics/sessions.md
 * 
 * Endpoints:
 * - GET /academics/groups/{group_id}/sessions - List group sessions
 * - POST /academics/groups/{group_id}/sessions - Add extra session
 * - GET /academics/sessions/{session_id} - Get session details
 * - PATCH /academics/sessions/{session_id} - Update session
 * - DELETE /academics/sessions/{session_id} - Delete session
 * - POST /academics/sessions/{session_id}/cancel - Cancel session
 * - POST /academics/sessions/{session_id}/reactivate - Reactivate session
 * - POST /academics/sessions/{session_id}/substitute - Mark substitute
 */

import client from "../../client";
import type { ApiResponse } from "../../../types/api";
import type {
  Session,
  UpdateSessionDTO,
  AddExtraSessionInput,
} from "../types/sessions";

export async function getGroupSessions(groupId: number): Promise<Session[]> {
  const response = await client.get<ApiResponse<Session[]>>(
    `/academics/groups/${groupId}/sessions`
  )
  const sessions = response.data.data || []
  return [...sessions].sort((a, b) =>
    (a.session_date || '').localeCompare(b.session_date || '')
  )
}

export async function getSessionDetails(sessionId: number): Promise<Session> {
  const response = await client.get<ApiResponse<Session>>(
    `/academics/sessions/${sessionId}`
  )
  return response.data.data
}

export async function updateSession(
  sessionId: number, data: UpdateSessionDTO
): Promise<Session> {
  const response = await client.patch<ApiResponse<Session>>(
    `/academics/sessions/${sessionId}`, data
  )
  return response.data.data
}

export async function deleteSession(sessionId: number): Promise<void> {
  await client.delete(`/academics/sessions/${sessionId}`)
}

export async function cancelSession(sessionId: number): Promise<Session> {
  const response = await client.post<ApiResponse<Session>>(
    `/academics/sessions/${sessionId}/cancel`
  )
  return response.data.data
}

export async function reactivateSession(sessionId: number): Promise<Session> {
  const response = await client.post<ApiResponse<Session>>(
    `/academics/sessions/${sessionId}/reactivate`
  )
  return response.data.data
}

export async function markSubstituteInstructor(
  sessionId: number, instructorId: number
): Promise<Session> {
  const response = await client.post<ApiResponse<Session>>(
    `/academics/sessions/${sessionId}/substitute`,
    { instructor_id: instructorId }
  )
  return response.data.data
}

export async function addExtraSession(data: AddExtraSessionInput): Promise<Session> {
  const response = await client.post<ApiResponse<Session>>(
    `/academics/groups/${data.group_id}/sessions`, data
  )
  return response.data.data
}
