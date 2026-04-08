import client from '../client'
import type { SessionAttendanceRowDTO, MarkAttendanceRequest } from './types'

export async function getSessionAttendance(sessionId: number): Promise<SessionAttendanceRowDTO[]> {
  const response = await client.get<{ data: SessionAttendanceRowDTO[] }>(`/attendance/session/${sessionId}`)
  return response.data.data || []
}

export async function markAttendance(
  sessionId: number,
  updates: { student_id: string; status: 'present' | 'absent' | 'late' | 'excused' | null }[]
): Promise<void> {
  const payload: MarkAttendanceRequest = {
    updates: updates
      .filter(u => u.status !== null)
      .map(u => ({
        student_id: parseInt(u.student_id),
        status: u.status as 'present' | 'absent'
      }))
  }
  
  await client.post(`/attendance/session/${sessionId}/mark`, payload)
}
