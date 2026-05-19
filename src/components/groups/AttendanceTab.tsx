import { useMemo } from 'react'
import { AttendanceGrid } from '../attendance/AttendanceGrid'
import { LevelSelector } from './detail/LevelSelector'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useGroupAttendance } from '../../hooks/useGroupAttendance'
import type { LevelDetailDTO, AttendanceRosterDTO, AttendanceSessionDTO } from '../../api/academics'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'

interface AttendanceTabProps {
  groupId: number
  levels: LevelDetailDTO[]
  activeLevelId: number | null
  currentLevelNumber: number
  instructorName?: string
  onLevelChange: (levelId: number) => void
}

/**
 * Transform new API roster to StudentRosterDTO format
 */
function transformRoster(roster: AttendanceRosterDTO[]): StudentRosterDTO[] {
  return roster.map(r => ({
    student_id: r.student_id,
    student_name: r.student_name,
    gender: 'male' as const,
    billing_status: r.billing_status === 'paid' ? 'paid' : 'due',
    balance: r.billing_status === 'paid' ? 0 : -1,
  }))
}

/**
 * Map new API status to old format status
 * New: 'present' | 'absent' | 'excused' | 'late' | null
 * Old: 'present' | 'absent' | 'cancelled' | null
 */
function mapStatus(status: 'present' | 'absent' | 'excused' | 'late' | null): 'present' | 'absent' | 'cancelled' | null {
  if (status === 'excused' || status === 'late') return 'present' // Treat as present for compatibility
  return status
}

/**
 * Transform new API sessions to SessionWithAttendanceDTO format
 */
function transformSessions(
  sessions: AttendanceSessionDTO[],
  roster: AttendanceRosterDTO[]
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
    group_id: 0, // Will be set by parent
    level_number: 0, // Will be set by parent
    actual_instructor_id: null,
    instructor_name: null,
    is_substitute: false,
    notes: null,
    // Convert attendance Record map to AttendanceRecordDTO array
    attendance: Object.entries(s.attendance).map(([studentId, status]) => {
      const student = roster.find(r => r.student_id === Number(studentId))
      return {
        student_id: Number(studentId),
        student_name: student?.student_name || '',
        gender: 'male' as const,
        status: mapStatus(status),
      }
    }),
  }))
}

export function AttendanceTab({
  groupId,
  levels,
  activeLevelId,
  currentLevelNumber,
  instructorName,
  onLevelChange,
}: AttendanceTabProps) {
  // Use activeLevelId directly instead of separate state to avoid sync issues
  const selectedLevelId = activeLevelId

  const selectedLevel = useMemo(() => {
    const found = levels.find(l => l.level_id === selectedLevelId) || levels[0] || null
    return found
  }, [levels, selectedLevelId])

  // NEW: Use consolidated attendance endpoint
  const {
    roster,
    sessions: attendanceSessions,
    isLoading,
    error,
  } = useGroupAttendance(
    groupId,
    selectedLevel?.level_number ?? null
  )

  // Transform data to AttendanceGrid-compatible format
  const transformedRoster = useMemo(() =>
    roster.length > 0 ? transformRoster(roster) : []
  , [roster])

  // Show sessions even if roster is empty (level 1 might have no students yet)
  const transformedSessions = useMemo(() => {
    if (attendanceSessions.length === 0) return []
    const transformed = transformSessions(attendanceSessions, roster)
    return transformed
  }, [attendanceSessions, roster])

  const handleLevelChange = (levelId: number) => {
    onLevelChange(levelId)
  }

  return (
    <div className="space-y-6">
      <LevelSelector
        levels={levels}
        activeLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
        currentLevelNumber={currentLevelNumber}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-slate-600">Loading attendance...</span>
            </div>
          ) : (
            <AttendanceGrid
              sessions={transformedSessions}
              roster={transformedRoster}
              groupId={groupId}
              level={selectedLevel?.level_number || currentLevelNumber}
              groupInstructorName={instructorName}
              isLoading={isLoading}
              selectedDate={undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}
