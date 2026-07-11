import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { AttendanceLevelResponse } from './types'

export async function markAttendance(
  sessionId: number,
  entries: { student_id: string; status: 'present' | 'absent' | 'cancelled' }[]
): Promise<void> {
  const payload: {
    entries: { student_id: number; status: 'present' | 'absent' | 'cancelled' }[]
  } = {
    entries: entries.map(e => ({
      student_id: parseInt(e.student_id),
      status: e.status,
    }))
  }

  await client.post(`/attendance/session/${sessionId}/mark`, payload)
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

