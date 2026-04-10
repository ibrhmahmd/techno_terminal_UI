// History Types - Status and attendance history records

import type { StudentStatus } from './models'

export interface StatusHistoryRecord {
  timestamp: string
  changed_by: number
  changed_by_name?: string
  old_status?: StudentStatus
  new_status?: StudentStatus
  action?: string
  new_priority?: number
  notes?: string
}

export interface AttendanceHistoryRecord {
  session_id: number
  session_date: string
  group_name: string
  course_name: string
  level_number: number
  status: 'present' | 'absent' | 'cancelled'
  notes?: string
}
