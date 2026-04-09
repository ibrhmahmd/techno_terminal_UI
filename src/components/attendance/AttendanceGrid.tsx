import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Session, UpdateSessionDTO } from '../../api/academics'
import { cancelSession, updateSession } from '../../api/academics'
import { getGroupRoster, type GroupRosterRowDTO } from '../../api/analytics'
import { getSessionAttendance, markAttendance, type SessionAttendanceRowDTO, type AttendanceStatus } from '../../api/attendance'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import { AttendanceHeader } from './AttendanceHeader'
import { AttendanceTableBody } from './AttendanceTableBody'
import { AttendanceFooter } from './AttendanceFooter'
import { SessionActionsRow } from './SessionActionsRow'
import { SessionNotesRow } from './SessionNotesRow'
import { EditSessionPopup } from './EditSessionPopup'

// Toggle cycle: null -> present -> absent -> cancelled -> null
const NEXT_STATE: Record<string, AttendanceStatus> = {
  'null': 'present',
  'present': 'absent',
  'absent': 'cancelled',
  'cancelled': null,
}

interface AttendanceGridProps {
  sessions: Session[]
  groupId: number
  level: number
  groupInstructorName?: string  // Fallback instructor name for consistency
}

interface StudentRow {
  student_id: string
  full_name: string
  gender: 'male' | 'female'
  billing_status: 'paid' | 'due'
  balance: number
  attendance: Map<number, AttendanceStatus>
}

export function AttendanceGrid({ sessions, groupId, level, groupInstructorName }: AttendanceGridProps) {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Session notes state
  const [sessionNotes, setSessionNotes] = useState<Record<number, string>>({})
  const [dirtyNotes, setDirtyNotes] = useState<Set<number>>(new Set())
  
  // Edit session modal state
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Debounced attendance state
  const [pendingAttendance, setPendingAttendance] = useState<{
    studentId: string
    sessionId: number
    status: AttendanceStatus
  } | null>(null)
  const attendanceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const displaySessions = useMemo(() => sessions.slice(0, 5), [sessions])
  const fetchCycleRef = useRef(0)

  const { showToast, ToastComponent } = useToast()

  // Initialize session notes when sessions change
  useEffect(() => {
    const initialNotes: Record<number, string> = {}
    sessions.forEach(s => {
      initialNotes[s.id] = s.notes || ''
    })
    setSessionNotes(initialNotes)
    setDirtyNotes(new Set())
  }, [sessions])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (attendanceTimeoutRef.current) {
        clearTimeout(attendanceTimeoutRef.current)
      }
    }
  }, [])

  const refetchData = useCallback(async () => {
    if (!groupId || displaySessions.length === 0) return

    setIsLoading(true)
    try {
      fetchCycleRef.current += 1
      console.debug(
        `[AttendanceGrid] Fetch #${fetchCycleRef.current} started for group ${groupId} with ${displaySessions.length} sessions`
      )

      const roster = await getGroupRoster(groupId, level)
      const attendancePromises = displaySessions.map((s) => getSessionAttendance(s.id))
      const attendanceResults = await Promise.all(attendancePromises)

      const studentRows: StudentRow[] = roster.map((r: GroupRosterRowDTO) => {
        const attendanceMap = new Map<number, AttendanceStatus>()
        displaySessions.forEach((session, idx) => {
          const sessionAttendance = attendanceResults[idx] || []
          const record = sessionAttendance.find((a: SessionAttendanceRowDTO) => Number(a.student_id) === r.student_id)
          attendanceMap.set(session.id, (record?.status as AttendanceStatus) || null)
        })

        return {
          student_id: String(r.student_id),
          full_name: r.student_name,
          gender: 'male', 
          billing_status: (r.balance < 0 ? 'Not Yet' : 'paid') as 'due' | 'paid',
          balance: r.balance,
          attendance: attendanceMap,
        }
      })

      setStudents(studentRows)
      setError(null)
      console.debug(
        `[AttendanceGrid] Fetch #${fetchCycleRef.current} completed for group ${groupId} (${studentRows.length} students)`
      )
    } catch (err) {
      console.error('Failed to refresh data:', err)
      setError('Failed to load attendance data')
      showToast('Failed to refresh data', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [groupId, level, displaySessions, showToast])

  // Load roster and attendance data
  useEffect(() => {
    void refetchData()
  }, [refetchData])

  // Handle note change
  const handleNoteChange = useCallback((sessionId: number, value: string) => {
    setSessionNotes(prev => ({ ...prev, [sessionId]: value }))
    setDirtyNotes(prev => new Set(prev).add(sessionId))
  }, [])

  // Handle edit session
  const handleEditSession = useCallback((session: Session) => {
    setEditingSession(session)
    setIsEditModalOpen(true)
  }, [])

  // Handle cancel session
  const handleCancelSession = useCallback(async (sessionId: number) => {
    if (!confirm('Are you sure you want to cancel this session?')) return
    
    try {
      await cancelSession(sessionId)
      showToast('Session cancelled successfully', 'success')
      await refetchData()
    } catch (err) {
      console.error('Failed to cancel session:', err)
      showToast('Failed to cancel session', 'error')
    }
  }, [refetchData, showToast])

  // Handle save edited session
  const handleSaveEditedSession = useCallback(async (sessionId: number, data: UpdateSessionDTO) => {
    try {
      await updateSession(sessionId, data)
      setIsEditModalOpen(false)
      setEditingSession(null)
      showToast('Session updated successfully', 'success')
      await refetchData()
    } catch (err) {
      console.error('Failed to update session:', err)
      showToast('Failed to update session', 'error')
    }
  }, [refetchData, showToast])

  const handleToggle = useCallback((studentId: string, sessionId: number) => {
    // Get current student data before optimistic update
    const student = students.find(s => s.student_id === studentId)
    if (!student) return

    const currentStatus = student.attendance.get(sessionId) || null
    const nextStatus = NEXT_STATE[String(currentStatus)]

    // Optimistic UI update
    setStudents((prev) => {
      return prev.map((s) => {
        if (s.student_id !== studentId) return s
        const newAttendance = new Map(s.attendance)
        newAttendance.set(sessionId, nextStatus)
        return { ...s, attendance: newAttendance }
      })
    })

    // Clear any existing timeout
    if (attendanceTimeoutRef.current) {
      clearTimeout(attendanceTimeoutRef.current)
    }

    // Set pending attendance
    setPendingAttendance({
      studentId,
      sessionId,
      status: nextStatus
    })

    // Debounce for 5 seconds
    attendanceTimeoutRef.current = setTimeout(async () => {
      if (nextStatus !== null) {
        try {
          await markAttendance(sessionId, [{
            student_id: studentId,
            status: nextStatus
          }])
          showToast('Attendance saved', 'success')
        } catch (err) {
          console.error('Failed to save attendance:', err)
          showToast('Failed to save attendance', 'error')
        }
      }
      setPendingAttendance(null)
    }, 5000)
  }, [students, showToast])

  // Save all attendance changes and notes
  const handleSaveAll = useCallback(async () => {
    console.log('[Save] handleSaveAll called')
    console.log('[Save] displaySessions:', displaySessions.length)
    console.log('[Save] students:', students.length)

    // Clear any pending debounced attendance to avoid double-saving
    if (attendanceTimeoutRef.current) {
      clearTimeout(attendanceTimeoutRef.current)
      attendanceTimeoutRef.current = null
    }
    // If there's pending attendance, include it in the batch save
    setPendingAttendance(null)

    if (displaySessions.length === 0) {
      console.log('[Save] No sessions to save, returning early')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // 1. Save attendance for each session
      const attendancePromises = displaySessions.map((session) => {
        const payload: Record<string, AttendanceStatus> = {}

        students.forEach((student) => {
          const status = student.attendance.get(session.id)
          if (status === 'present' || status === 'absent' || status === 'cancelled') {
            payload[student.student_id] = status
          }
        })

        if (Object.keys(payload).length > 0) {
          const entries = Object.entries(payload).map(([student_id, status]) => ({
            student_id,
            status,
          }))
          return markAttendance(session.id, entries)
        }
        return Promise.resolve()
      })
      
      // 2. Save notes for dirty sessions
      const notesPromises = Array.from(dirtyNotes).map(sessionId => {
        const notes = sessionNotes[sessionId]
        return updateSession(sessionId, { notes })
      })

      await Promise.all([...attendancePromises, ...notesPromises])
      
      console.log('[Save] All saves completed successfully!')
      
      // 3. Clear dirty state
      setDirtyNotes(new Set())
      
      // 4. REFETCH data (soft refresh - no page reload)
      await refetchData()
      showToast('All changes saved successfully!', 'success')
    } catch (err) {
      console.error('[Save] Failed to save:', err)
      setError('Failed to save changes')
      showToast('Failed to save changes', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [displaySessions, students, dirtyNotes, sessionNotes, refetchData, showToast])

  const handleCancel = useCallback(() => {
    refetchData()
  }, [refetchData])

  if (isLoading) {
    return (
      <div className="p-8 text-center text-outline-variant flex items-center justify-center gap-2">
        <LoadingSpinner size="sm" />
        <span>Loading attendance...</span>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center text-outline-variant">
        <p className="mb-2">No students enrolled in this group.</p>
        <p className="text-sm">Enroll students to start marking attendance.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-outline-variant/10 shadow-sm overflow-hidden">
      {/* Header Instructions */}
      <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/10">
        <p className="text-xs text-outline">
          Click a cell to toggle: empty → present (✓) → absent (✗) → empty
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-b border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <AttendanceHeader sessions={sessions} groupInstructorName={groupInstructorName} />
          
          {/* Session Actions Row */}
          <tbody>
            <SessionActionsRow 
              sessions={sessions} 
              onEdit={handleEditSession}
              onCancel={handleCancelSession}
              disabled={isSaving}
            />
          </tbody>
          
          <AttendanceTableBody
            students={students}
            sessions={sessions}
            onToggle={handleToggle}
          />
          
          {/* Session Notes Row */}
          <tbody>
            <SessionNotesRow 
              sessions={sessions}
              notes={sessionNotes}
              onNoteChange={handleNoteChange}
              disabled={isSaving}
            />
          </tbody>
        </table>
      </div>

      <AttendanceFooter
        isSaving={isSaving}
        onCancel={handleCancel}
        onSave={handleSaveAll}
        hasError={!!error}
      />
      
      {/* Edit Session Modal */}
      <EditSessionPopup
        session={editingSession}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSession(null)
        }}
        onSave={handleSaveEditedSession}
      />
      {ToastComponent}
    </div>
  )
}
