import type { AttendanceStatus } from '../api/attendance'

/**
 * Attendance status toggle cycle: not_taken -> present -> absent -> not_taken
 * Single source of truth - shared by the desktop grid and the mobile sheet.
 */
export const ATTENDANCE_STATUSES = ['not_taken', 'present', 'absent'] as const

export function getNextStatus(current: AttendanceStatus): AttendanceStatus {
  const map: Record<string, AttendanceStatus> = {
    'not_taken': 'present',
    'present': 'absent',
    'absent': 'not_taken',
  }
  return map[String(current)] ?? 'not_taken'
}
