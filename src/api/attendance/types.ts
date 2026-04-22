export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | null

export interface SessionAttendanceRowDTO {
  student_id: string
  status: AttendanceStatus
}

export interface AttendanceUpdate {
  student_id: string
  status: AttendanceStatus
}

// Alias for backward compatibility
export type AttendanceEntry = AttendanceUpdate

export interface MarkAttendanceRequest {
  entries: {
    student_id: number
    status: 'present' | 'absent' | 'cancelled'
  }[]
}
