import { client } from '../client'

export async function markAttendance(
  sessionId: number,
  entries: { student_id: string; status: 'present' | 'absent' | 'cancelled' | null }[]
): Promise<void> {
  const entries_filtered = entries.filter(
    (e): e is typeof e & { status: 'present' | 'absent' | 'cancelled' } => e.status !== null
  )
  const payload: {
    entries: { student_id: number; status: 'present' | 'absent' | 'cancelled' }[]
  } = {
    entries: entries_filtered.map(e => ({
      student_id: parseInt(e.student_id),
      status: e.status,
    }))
  }

  await client.post(`/attendance/session/${sessionId}/mark`, payload)
}

