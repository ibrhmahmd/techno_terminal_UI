import type { AttendanceRosterDTO, AttendanceSessionDTO } from '../api/academics'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../api/dashboard'

/**
 * Transform new API roster to StudentRosterDTO format
 */
export function transformRoster(roster: AttendanceRosterDTO[]): StudentRosterDTO[] {
  return roster.map(r => ({
    student_id: r.student_id,
    student_name: r.student_name,
    gender: 'male' as const, // Default fallback
    billing_status: r.billing_status === 'paid' ? 'paid' : 'due',
    balance: r.billing_status === 'paid' ? 0 : -1,
  }))
}

/**
 * Map new API status to old format status
 * New: 'present' | 'absent' | 'excused' | 'late' | null
 * Old: 'present' | 'absent' | 'cancelled' | null
 */
export function mapStatus(status: 'present' | 'absent' | 'excused' | 'late' | null): 'present' | 'absent' | 'cancelled' | null {
  if (status === 'excused' || status === 'late') return 'present' // Treat as present for compatibility
  return status
}

/**
 * Transform new API sessions to SessionWithAttendanceDTO format
 */
export function transformSessions(
  sessions: AttendanceSessionDTO[],
  roster: AttendanceRosterDTO[],
  groupId: number,
  levelNumber: number
): SessionWithAttendanceDTO[] {
  return sessions.map(s => ({
    session_id: s.session_id,
    id: s.session_id, // Alias
    session_number: s.session_number,
    date: s.date,
    session_date: s.date, // Alias
    time_start: s.time_start,
    start_time: s.time_start, // Alias
    time_end: s.time_end,
    end_time: s.time_end, // Alias
    status: s.status,
    is_extra_session: s.is_extra_session,
    group_id: groupId,
    level_number: levelNumber,
    actual_instructor_id: null,
    instructor_name: null,
    is_substitute: false,
    notes: null,
    // Convert attendance Record map to AttendanceRecordDTO array
    attendance: Object.entries(s.attendance || {}).map(([studentId, status]) => {
      const student = roster.find(r => r.student_id === Number(studentId))
      return {
        student_id: Number(studentId),
        student_name: student?.student_name || '',
        gender: 'male' as const,
        status: mapStatus(status as any),
      }
    }),
  }))
}
