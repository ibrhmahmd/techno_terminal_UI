export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | null

export type AttendanceEntry = {
  student_id: string
  status: AttendanceStatus
}


