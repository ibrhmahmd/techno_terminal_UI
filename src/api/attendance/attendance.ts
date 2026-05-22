import { client } from '../client'
import type { SessionAttendanceRowDTO, MarkAttendanceRequest } from './types'

export async function getSessionAttendance(sessionId: number): Promise<SessionAttendanceRowDTO[]> {
  const response = await client.get<{ data: SessionAttendanceRowDTO[] }>(`/attendance/session/${sessionId}`)
  return response.data.data || []
}

export async function markAttendance(
  sessionId: number,
  entries: { student_id: string; status: 'present' | 'absent' | 'cancelled' | null }[]
): Promise<void> {
  const payload: MarkAttendanceRequest = {
    entries: entries
      .filter(e => e.status !== null)
      .map(e => ({
        student_id: parseInt(e.student_id),
        status: e.status as 'present' | 'absent' | 'cancelled'
      }))
  }

  await client.post(`/attendance/session/${sessionId}/mark`, payload)
}

