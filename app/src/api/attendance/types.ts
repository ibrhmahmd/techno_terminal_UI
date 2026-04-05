export interface SessionAttendanceRowDTO {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
}

export interface AttendanceUpdate {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
}

export interface MarkAttendanceRequest {
  updates: {
    student_id: number
    status: 'present' | 'absent' 
  }[]
}
