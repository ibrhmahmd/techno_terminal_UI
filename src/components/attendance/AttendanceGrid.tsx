import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UpdateSessionDTO } from '../../api/academics'
import { cancelSession, updateSession } from '../../api/academics'
import { getGroupRoster } from '../../api/analytics'
import { markAttendance, type AttendanceStatus } from '../../api/attendance'
import { formatTime, getInitials } from '../../utils/formatting'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import { AttendanceHeader } from './AttendanceHeader'
import { AttendanceTableBody } from './AttendanceTableBody'
import { AttendanceFooter } from './AttendanceFooter'
import { SessionActionsRow } from './SessionActionsRow'
import { SessionNotesRow } from './SessionNotesRow'
import { EditSessionPopup } from './EditSessionPopup'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'

// Toggle cycle: null -> present -> absent -> cancelled -> null
const NEXT_STATE: Record<string, AttendanceStatus> = {
  'null': 'present',
  'present': 'absent',
  'absent': 'cancelled',
  'cancelled': null,
}

interface AttendanceGridProps {
  sessions: SessionWithAttendanceDTO[]
  roster?: StudentRosterDTO[]   // NEW: Optional roster from dashboard API
  groupId: number
  level: number
  groupInstructorName?: string  // Fallback instructor name for consistency
  groupName?: string            // Group name to display in header
  courseName?: string           // Course name to display in header
}

interface StudentRow {
  student_id: string
  full_name: string
  gender: 'male' | 'female'
  billing_status: 'paid' | 'due'
  balance: number
  attendance: Map<number, AttendanceStatus>
}

export function AttendanceGrid({ sessions, roster, groupId, level, groupInstructorName, groupName, courseName }: AttendanceGridProps) {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track if any changes have been made (attendance, notes, edits, cancels)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Session notes state
  const [sessionNotes, setSessionNotes] = useState<Record<number, string>>({})
  const [dirtyNotes, setDirtyNotes] = useState<Set<number>>(new Set())
  
  // Edit session modal state
  const [editingSession, setEditingSession] = useState<SessionWithAttendanceDTO | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Debounced attendance state
  const attendanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displaySessions = useMemo(() => sessions.slice(0, 5), [sessions])
  const fetchCycleRef = useRef(0)

  const { showToast, ToastComponent } = useToast()

  // Initialize session notes when sessions change
  useEffect(() => {
    const initialNotes: Record<number, string> = {}
    sessions.forEach(s => {
      initialNotes[s.session_id] = s.notes || ''
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

      // NEW: Use provided roster if available, otherwise fall back to old API
      let rosterData: StudentRosterDTO[]
      if (roster && roster.length > 0) {
        rosterData = roster
        console.debug(`[AttendanceGrid] Using provided roster (${roster.length} students)`)
      } else {
        // Fallback: fetch from old API (for backward compatibility with Group Detail page)
        console.debug(`[AttendanceGrid] Fetching roster from API`)
        const oldRoster = await getGroupRoster(groupId, level)
        rosterData = oldRoster.map(r => ({
          student_id: r.student_id,
          student_name: r.student_name,
          gender: 'male' as const,
          billing_status: (r.balance < 0 ? 'due' : 'paid') as 'due' | 'paid',
          balance: r.balance
        }))
      }

      // Build student rows using roster + session attendance
      const studentRows: StudentRow[] = rosterData.map((r) => {
        const attendanceMap = new Map<number, AttendanceStatus>()
        displaySessions.forEach((session) => {
          // Get attendance from the embedded data in the session
          const sessionAttendance = session.attendance || []
          const record = sessionAttendance.find((a) => a.student_id === r.student_id)
          attendanceMap.set(session.session_id, record?.status || null)
        })

        return {
          student_id: String(r.student_id),
          full_name: r.student_name,
          gender: r.gender || 'male',
          billing_status: r.billing_status,
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
  }, [groupId, level, displaySessions, roster, showToast])

  // Load roster and attendance data
  useEffect(() => {
    void refetchData()
  }, [refetchData])

  // Handle note change
  const handleNoteChange = useCallback((sessionId: number, value: string) => {
    setSessionNotes(prev => ({ ...prev, [sessionId]: value }))
    setDirtyNotes(prev => new Set(prev).add(sessionId))
    setHasChanges(true)
  }, [])

  // Handle edit session
  const handleEditSession = useCallback((session: SessionWithAttendanceDTO) => {
    setEditingSession(session)
    setIsEditModalOpen(true)
    setHasChanges(true)
  }, [])

  // Handle cancel session
  const handleCancelSession = useCallback(async (sessionId: number) => {
    if (!confirm('Are you sure you want to cancel this session?')) return
    
    try {
      await cancelSession(sessionId)
      setHasChanges(true)
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
    
    // Mark that changes have been made
    setHasChanges(true)

    // Clear any existing timeout
    if (attendanceTimeoutRef.current) {
      clearTimeout(attendanceTimeoutRef.current)
    }

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
          const status = student.attendance.get(session.session_id)
          if (status === 'present' || status === 'absent' || status === 'cancelled') {
            payload[student.student_id] = status
          }
        })
        
        if (Object.keys(payload).length > 0) {
          const entries = Object.entries(payload).map(([student_id, status]) => ({
            student_id,
            status,
          }))
          return markAttendance(session.session_id, entries)
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
      
      // 3. Clear dirty state and changes flag
      setDirtyNotes(new Set())
      setHasChanges(false)
      
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
    setHasChanges(false)
    setDirtyNotes(new Set())
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

  // Get time from first session
  const sessionTime = sessions.length > 0
    ? `${formatTime(sessions[0].start_time)} - ${formatTime(sessions[0].end_time) || 'Next Hour'}`
    : ''

  const currentInstructorName = groupInstructorName || 'TBA'
  const instructorInitials = getInitials(currentInstructorName, '?')

  const handleCardClick = () => {
    navigate(`/groups/${groupId}`)
  }

  return (
    <div className="bg-white border border-outline-variant/10 shadow-sm overflow-hidden">
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px] border-2 border-slate-400">
          {/* Group Header Row */}
          {groupName && (
            <thead>
              <tr className="bg-slate-50">
                <th colSpan={6} className="p-0 border-b-2 border-slate-400">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-8 bg-secondary rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <div>
                          <h3 className="font-headline text-lg font-bold text-slate-900 leading-tight">{groupName}</h3>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{courseName}</p>
                        </div>
                        <button
                          onClick={handleCardClick}
                          className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">info</span>
                        </button>
                      </div>
                      <div className="ml-2 border-l border-slate-200 pl-4">
                        <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-700">schedule</span>
                          {sessionTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                          Instructor
                        </p>
                        <p className="font-bold text-sm text-slate-900">{currentInstructorName}</p>
                      </div>
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-300">
                        {instructorInitials}
                      </div>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
          )}

          <AttendanceHeader sessions={sessions} groupInstructorName={groupInstructorName} />
          
          {/* Session Actions Row */}
          <tbody className="border-b-2 border-slate-300">
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
          <tbody className="border-t-2 border-slate-300">
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
        hasChanges={hasChanges}
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
