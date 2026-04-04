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
  const student_statuses: Record<string, string> = {}
  updates.forEach(u => {
    if (u.status) {
      student_statuses[u.student_id] = u.status
    }
  })
  
  const payload: MarkAttendanceRequest = {
    session_id: sessionId,
    student_statuses: student_statuses as Record<string, 'present' | 'absent' | 'late' | 'excused'>
  }
  
  await client.post(`/attendance/session/${sessionId}`, payload)
}
