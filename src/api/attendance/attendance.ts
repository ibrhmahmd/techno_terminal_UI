import { client } from '../client'

export async function markAttendance(
  sessionId: number,
  entries: { student_id: string; status: 'present' | 'absent' | 'not_taken' }[]
): Promise<void> {
  const validEntries = entries.filter(e => e.status !== 'not_taken')
  if (validEntries.length === 0) return

  await client.post(`/attendance/session/${sessionId}/mark`, {
    entries: validEntries.map(e => ({
      student_id: parseInt(e.student_id),
      status: e.status,
    }))
  })
}

// getAttendanceForLevel and its DTOs live in api/academics (source of truth).
export { getAttendanceForLevel } from '../academics'
export type { AttendanceLevelResponse } from '../academics'
