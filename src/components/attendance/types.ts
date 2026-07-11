import type { AttendanceStatus } from '../../api/attendance'

export interface StudentRowData {
  student_id: string
  full_name: string
  billing_status: 'paid' | 'due'
  balance?: number
  gender?: 'male' | 'female'
  attendance: Map<number, AttendanceStatus>
}
