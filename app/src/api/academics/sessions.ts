import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { Session, UpdateSessionDTO, AddExtraSessionInput } from './types'

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

export async function markSubstituteInstructor(
  sessionId: number, substituteId: number
): Promise<Session> {
  const response = await client.post<ApiResponse<Session>>(
    `/academics/sessions/${sessionId}/substitute`,
    { substitute_instructor_id: substituteId }
  )
  return response.data.data
}

export async function addExtraSession(data: AddExtraSessionInput): Promise<Session> {
  const response = await client.post<ApiResponse<Session>>(
    `/academics/groups/${data.group_id}/sessions`, data
  )
  return response.data.data
}
