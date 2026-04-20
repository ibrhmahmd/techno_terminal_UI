// History Types - Status and attendance history records
// @see docs/api/crm/student_history.md

import type { StudentStatus } from './models'

/**
 * Status change history entry - aligned with API documentation
 * @see docs/api/crm/student_history.md#StatusHistoryEntry
 */
export interface StatusHistoryEntry {
  id: number
  student_id: number
  old_status?: string | null
  new_status: string
  changed_at: string
  changed_by?: number | null
  changed_by_name?: string | null
  reason?: string | null
  notes?: string | null
}

/**
 * @deprecated This interface is not documented in the official API specification.
 * Do not use in new code. Will be removed in v2.0.
 */
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

/**
 * @deprecated This interface and its endpoint are not documented in the official API specification.
 * Do not use in new code. Will be removed in v2.0.
 */
export interface AttendanceHistoryRecord {
  session_id: number
  session_date: string
  group_name: string
  course_name: string
  level_number: number
  status: 'present' | 'absent' | 'cancelled'
  notes?: string
}
