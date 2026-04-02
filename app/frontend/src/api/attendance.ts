import client from './client'

export interface AttendanceRecord {
  id: number
  session_id: number
  student_id: number
  student_name: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
  notes: string | null
}

export interface AttendanceGridData {
  session_id: number
  group_id: number
  session_date: string
  students: AttendanceRecord[]
}

export async function getSessionAttendance(sessionId: number): Promise<AttendanceGridData> {
  const response = await client.get<AttendanceGridData>(`/attendance/session/${sessionId}`)
  return response.data
}

export interface AttendanceUpdate {
  student_id: number
  status: 'present' | 'absent' | 'late' | 'excused' | null
  notes?: string
}

export async function markAttendance(
  sessionId: number,
  attendance: AttendanceUpdate[]
): Promise<void> {
  await client.post(`/attendance/session/${sessionId}/mark`, { attendance })
}
