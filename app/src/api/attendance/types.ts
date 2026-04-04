export interface SessionAttendanceRowDTO {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
}

export interface AttendanceUpdate {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
}

export interface MarkAttendanceRequest {
  session_id: number
  student_statuses: Record<string, 'present' | 'absent' | 'late' | 'excused'>
  marked_by_user_id?: number
}
