import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { AttendanceLevelResponse } from './types'

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

/**
 * Get consolidated attendance data for a specific level
 * Returns roster and sessions with attendance map
 * Auth: require_any
 */
export async function getAttendanceForLevel(
  groupId: number,
  levelNumber: number
): Promise<AttendanceLevelResponse> {
  const response = await client.get<ApiResponse<AttendanceLevelResponse>>(
    `/academics/groups/${groupId}/attendance`,
    { params: { level_number: levelNumber } }
  )
  return response.data.data
}

