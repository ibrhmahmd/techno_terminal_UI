import client from './client'

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  student_name: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
  notes: string | null
}

export interface AttendanceGridData {
  session_id: string
  group_id: string
  session_date: string
  students: AttendanceRecord[]
}

export async function getSessionAttendance(sessionId: string): Promise<AttendanceGridData> {
  const response = await client.get<{ data: AttendanceGridData }>(`/attendance/session/${sessionId}`)
  return response.data.data
}

export interface AttendanceUpdate {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
  notes?: string
}

export async function markAttendance(
  sessionId: string,
  attendance: AttendanceUpdate[]
): Promise<void> {
  await client.post(`/attendance/session/${sessionId}/mark`, { attendance })
}
