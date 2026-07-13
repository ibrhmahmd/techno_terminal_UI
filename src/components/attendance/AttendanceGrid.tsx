import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../hooks/queryKeys'
import type { UpdateSessionDTO } from '../../api/academics'
import { cancelSession, updateSession, deleteSession, reactivateSession } from '../../api/academics'
import { markAttendance, type AttendanceStatus } from '../../api/attendance'
import { getInitials } from '../../utils/formatting'
import { useToast } from '../common/Toast'
import { AttendanceHeader } from './AttendanceHeader'
import { AttendanceTableBody } from './AttendanceTableBody'
import { AttendanceFooter } from './AttendanceFooter'
import { SessionActionsRow } from './SessionActionsRow'
import { SessionNotesRow } from './SessionNotesRow'
import { EditSessionPopup } from './EditSessionPopup'
import { AddSessionDialog } from '../groups/detail/AddSessionDialog'
import { PaymentSummaryStrip } from './PaymentSummaryStrip'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'
import type { StudentRowData } from './types'

// Toggle cycle: not_taken -> present -> absent -> not_taken
function getNextStatus(current: AttendanceStatus): AttendanceStatus {
  const map: Record<string, AttendanceStatus> = {
    'not_taken': 'present',
    'present': 'absent',
    'absent': 'not_taken',
  }
  return map[String(current)] ?? 'not_taken'
}

interface AttendanceGridProps {
  sessions: SessionWithAttendanceDTO[]
  roster: StudentRosterDTO[]   // Required: roster from parent component (dashboard or group API)
  groupId: number
  level: number
  groupInstructorName?: string  // Fallback instructor name for consistency
  groupName?: string            // Group name to display in header
  courseName?: string           // Course name to display in header
  selectedDate?: string         // Date for dashboard cache invalidation
}

export function AttendanceGrid({ sessions, roster, groupId, level, groupInstructorName, groupName, courseName, selectedDate }: AttendanceGridProps) {
  const navigate = useNavigate()
  const qc = useQueryClient()
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
  
  // Add session modal state
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false)

  // EPIC-4: Batch save state
  const [pendingChanges, setPendingChanges] = useState<Map<number, { student_id: string; status: AttendanceStatus }[]>>(new Map())
  const [sessionSaveStatus, setSessionSaveStatus] = useState<Map<number, 'idle' | 'saving' | 'success' | 'error'>>(new Map())
  const [dirtySessions, setDirtySessions] = useState<Set<number>>(new Set())
  
  // Optimistic overrides — merged into derived students during pending save
  const [localOverrides, setLocalOverrides] = useState<Map<string, AttendanceStatus>>(new Map())

  const { showToast, ToastComponent } = useToast()

  // Derive student rows directly from props + local overrides — no state, no fetch cycle
  const students = useMemo<StudentRowData[]>(() => {
    const rosterData: StudentRosterDTO[] = roster || []
    return rosterData.map((r) => {
      const attendanceMap = new Map<number, AttendanceStatus>()
      sessions.forEach((session) => {
        const overrideKey = `${r.student_id}-${session.session_id}`
        if (localOverrides.has(overrideKey)) {
          attendanceMap.set(session.session_id, localOverrides.get(overrideKey)!)
        } else {
          const sessionAttendance = session.attendance || []
          const record = sessionAttendance.find((a) => a.student_id === r.student_id)
          const rawStatus = record?.status ?? null
          attendanceMap.set(session.session_id, rawStatus === 'cancelled' || rawStatus === null ? 'not_taken' : rawStatus)
        }
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
  }, [roster, sessions, localOverrides])

  // Initialize session notes when sessions change (preserve dirty notes)
  const initialSessionNotes = useMemo(() => {
    const notes: Record<number, string> = {}
    sessions.forEach(s => {
      notes[s.session_id] = s.notes || ''
    })
    return notes
  }, [sessions])

  useEffect(() => {
    if (dirtyNotes.size === 0) {
      setSessionNotes(initialSessionNotes)
    }
  }, [initialSessionNotes, dirtyNotes.size])

  const refetchData = useCallback(async () => {
    // Students are now derived via useMemo — nothing to fetch
    setError(null)
    setLocalOverrides(new Map())
  }, [])

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
  }, [])

  // Handle cancel session
  const handleCancelSession = useCallback(async (sessionId: number) => {
    try {
      await cancelSession(sessionId)
      setHasChanges(true)
      showToast('Session cancelled successfully', 'success')
      if (selectedDate) {
        await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      }
      await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
      await refetchData()
    } catch (err) {
      console.error('Failed to cancel session:', err)
      showToast('Failed to cancel session', 'error')
    }
  }, [refetchData, showToast, selectedDate, qc, groupId])

  // Handle delete session
  const handleDeleteSession = useCallback(async (sessionId: number) => {
    try {
      await deleteSession(sessionId)
      setHasChanges(true)
      showToast('Session deleted successfully', 'success')
      if (selectedDate) {
        await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      }
      await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
      await refetchData()
    } catch (err) {
      console.error('Failed to delete session:', err)
      showToast('Failed to delete session', 'error')
    }
  }, [refetchData, showToast, selectedDate, qc, groupId])

  // Handle reactivate session
  const handleReactivateSession = useCallback(async (sessionId: number) => {
    try {
      await reactivateSession(sessionId)
      setHasChanges(true)
      showToast('Session reactivated successfully', 'success')
      if (selectedDate) {
        await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      }
      await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
      await refetchData()
    } catch (err) {
      console.error('Failed to reactivate session:', err)
      showToast('Failed to reactivate session', 'error')
    }
  }, [refetchData, showToast, selectedDate, qc, groupId])

  // Handle complete session
  const handleCompleteSession = useCallback(async (sessionId: number) => {
    try {
      await updateSession(sessionId, { status: 'completed' })
      setHasChanges(true)
      showToast('Session marked as completed successfully', 'success')
      if (selectedDate) {
        await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      }
      await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
      await refetchData()
    } catch (err) {
      console.error('Failed to complete session:', err)
      showToast('Failed to complete session', 'error')
    }
  }, [refetchData, showToast, selectedDate, qc, groupId])

  // Handle save edited session
  const handleSaveEditedSession = useCallback(async (sessionId: number, data: UpdateSessionDTO) => {
    try {
      await updateSession(sessionId, data)
      setIsEditModalOpen(false)
      setEditingSession(null)
      showToast('Session updated successfully', 'success')
      if (selectedDate) {
        await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      }
      await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
      await refetchData()
    } catch (err) {
      console.error('Failed to update session:', err)
      showToast('Failed to update session', 'error')
    }
  }, [refetchData, showToast, selectedDate, qc, groupId])

  const handleToggle = useCallback((studentId: string | number, sessionId: number) => {
    const studentIdStr = String(studentId)
    // Read current status from derived students
    const student = students.find(s => s.student_id === studentIdStr)
    if (!student) return

    const currentStatus = student.attendance.get(sessionId) ?? 'not_taken'
    const nextStatus = getNextStatus(currentStatus)

    // Optimistic UI: store override in localOverrides
    setLocalOverrides(prev => {
      const newMap = new Map(prev)
      newMap.set(`${studentIdStr}-${sessionId}`, nextStatus)
      return newMap
    })
    
    // Queue change for batch save
    setPendingChanges(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(sessionId) || []
      const filtered = existing.filter(e => e.student_id !== studentIdStr)
      newMap.set(sessionId, [...filtered, { student_id: studentIdStr, status: nextStatus }])
      return newMap
    })
    
    setDirtySessions(prev => new Set(prev).add(sessionId))
    setSessionSaveStatus(prev => {
      const newMap = new Map(prev)
      newMap.set(sessionId, 'idle')
      return newMap
    })
    setHasChanges(true)
  }, [students])

  // Save all attendance changes and notes
  const handleSaveAll = useCallback(async () => {
    if (pendingChanges.size === 0 && dirtyNotes.size === 0) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // 1. Set all dirty sessions to 'saving' status
      const sessionsToSave = Array.from(pendingChanges.keys())
      sessionsToSave.forEach(sessionId => {
        setSessionSaveStatus(prev => new Map(prev).set(sessionId, 'saving'))
      })

      // 2. Save attendance for each session (parallel)
      const attendancePromises = sessionsToSave.map(async (sessionId) => {
        const entries = pendingChanges.get(sessionId) || []
        
        if (entries.length === 0) {
          return { sessionId, status: 'success' as const }
        }
        
        try {
          await markAttendance(sessionId, entries)
          return { sessionId, status: 'success' as const }
        } catch (err) {
          console.error(`[Save] Failed to save session ${sessionId}:`, err)
          return { sessionId, status: 'error' as const, error: err }
        }
      })
      
      // 3. Save notes for dirty sessions
      const notesPromises = Array.from(dirtyNotes).map(async (sessionId) => {
        // Fix 3: normalize empty string to null so the DB stores null, not ""
        const notes = sessionNotes[sessionId] || null
        try {
          await updateSession(sessionId, { notes })
          return { sessionId, type: 'notes', status: 'success' as const }
        } catch (err) {
          console.error(`[Save] Failed to save notes for session ${sessionId}:`, err)
          return { sessionId, type: 'notes', status: 'error' as const, error: err }
        }
      })

      // 4. Wait for all saves to complete
      const results = await Promise.allSettled([...attendancePromises, ...notesPromises])
      
      // 5. Update per-session status
      const failedSessions: number[] = []
      const successfulSessions: number[] = []
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const val = result.value
          // Fix 2: notes results carry a 'type' discriminant — skip them here;
          // they are handled exclusively in the setDirtyNotes block below.
          if ('type' in val && val.type === 'notes') return
          setSessionSaveStatus(prev => new Map(prev).set(val.sessionId, val.status))
          if (val.status === 'success') {
            successfulSessions.push(val.sessionId)
          } else {
            failedSessions.push(val.sessionId)
          }
        } else {
          console.error('[Save] Unexpected error:', result.reason)
        }
      })
      
      // 6. Clear successfully saved sessions from pending
      if (successfulSessions.length > 0) {
        setPendingChanges(prev => {
          const newMap = new Map(prev)
          successfulSessions.forEach(id => newMap.delete(id))
          return newMap
        })
        
        setDirtySessions(prev => {
          const newSet = new Set(prev)
          successfulSessions.forEach(id => newSet.delete(id))
          return newSet
        })
      }
      
      // 7. Check if any sessions remain unsaved — compute from results, not stale closures
      const failedCount = results.filter(r => {
        if (r.status !== 'fulfilled') return true
        return 'status' in r.value && r.value.status === 'error'
      }).length
      if (failedCount === 0) {
        // No failures — all pending attendance and notes saved successfully
        setHasChanges(false)
      } else {
        // Some sessions failed — check remaining after state flushes
        queueMicrotask(() => {
          setPendingChanges(pending => {
            setDirtyNotes(dirty => {
              if (pending.size === 0 && dirty.size === 0) {
                setHasChanges(false)
              }
              return dirty
            })
            return pending
          })
        })
      }
      
      // 8. Invalidate caches after save
      if (selectedDate) {
        await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      }
      await qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, level) })

      // 9. REFETCH data (soft refresh - no page reload)
      await refetchData()

      // Fix 1: Clear dirty notes AFTER cache invalidation + refetch have resolved.
      // Doing this earlier caused the useEffect (line ~109) to see dirtyNotes.size=0
      // while the refetch was still in-flight, making it overwrite sessionNotes with
      // potentially stale cache data — reverting the textarea to the old note value
      // even though the PATCH to the DB had already succeeded.
      setDirtyNotes(prev => {
        const newSet = new Set(prev)
        results.forEach(result => {
          if (result.status === 'fulfilled' &&
              'type' in result.value &&
              result.value.type === 'notes' &&
              result.value.status === 'success') {
            newSet.delete(result.value.sessionId)
          }
        })
        return newSet
      })

      // 10. Show appropriate toast message
      if (failedSessions.length === 0) {
        const notesSaved = results.filter(r => r.status === 'fulfilled' && 'type' in r.value && r.value.type === 'notes' && r.value.status === 'success').length
        const totalSaved = successfulSessions.length + notesSaved
        showToast(`Saved ${totalSaved} change(s) successfully!`, 'success')
      } else if (successfulSessions.length === 0) {
        showToast('Failed to save all changes', 'error')
      } else {
        showToast(`Saved ${successfulSessions.length}, ${failedSessions.length} failed - click retry`, 'error')
      }
    } catch (err) {
      console.error('[Save] Failed to save:', err)
      setError('Failed to save changes')
      showToast('Failed to save changes', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [pendingChanges, dirtyNotes, sessionNotes, refetchData, showToast, selectedDate, qc, groupId, level])

  const handleRetrySession = useCallback(async (sessionId: number) => {
    const entries = pendingChanges.get(sessionId)
    if (!entries || entries.length === 0) return
    
    setSessionSaveStatus(prev => new Map(prev).set(sessionId, 'saving'))
    
    try {
      await markAttendance(sessionId, entries)
      
      setPendingChanges(prev => {
        const newMap = new Map(prev)
        newMap.delete(sessionId)
        return newMap
      })
      
      setDirtySessions(prev => {
        const newSet = new Set(prev)
        newSet.delete(sessionId)
        return newSet
      })
      
      setSessionSaveStatus(prev => new Map(prev).set(sessionId, 'success'))
      
      // Use functional updater to avoid stale closure on pendingChanges.size
      setPendingChanges(currentPending => {
        queueMicrotask(() => {
          setDirtyNotes(currentDirty => {
            if (currentPending.size === 0 && currentDirty.size === 0) {
              setHasChanges(false)
            }
            return currentDirty
          })
        })
        return currentPending
      })
      
      // Invalidate caches after successful retry
      await Promise.all([
        selectedDate
          ? qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
          : Promise.resolve(),
        qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, level) }),
      ])
      
      showToast('Session saved successfully', 'success')
    } catch (err) {
      console.error(`[Retry] Failed to save session ${sessionId}:`, err)
      setSessionSaveStatus(prev => new Map(prev).set(sessionId, 'error'))
      showToast('Failed to save session', 'error')
    }
  }, [pendingChanges, showToast, selectedDate, qc, groupId, level])

  const handleCancel = useCallback(() => {
    setHasChanges(false)
    setDirtyNotes(new Set())
    // Fix 4: explicitly reset sessionNotes to server values rather than relying
    // on the useEffect side-effect chain (which requires dirtyNotes.size=0 AND
    // a fresh initialSessionNotes — fragile). refetchData() only resets
    // localOverrides; it does not invalidate the cache or trigger a fetch.
    setSessionNotes(initialSessionNotes)
    setPendingChanges(new Map())
    setDirtySessions(new Set())
    setSessionSaveStatus(new Map())
    refetchData()
  }, [refetchData, initialSessionNotes])

  if (students.length === 0) {
    return (
      <div className="p-8 text-center text-outline-variant">
        <p className="mb-2">No students enrolled in this group.</p>
        <p className="text-sm">Enroll students to start marking attendance.</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8 text-center text-outline-variant">
        <p className="mb-2">No sessions have been generated for this level yet.</p>
        <p className="text-sm">{students.length} student{students.length !== 1 ? 's' : ''} enrolled — generate sessions to start marking attendance.</p>
      </div>
    )
  }

  const currentInstructorName = groupInstructorName || 'TBA'
  const instructorInitials = getInitials(currentInstructorName, '?')

  const handleCardClick = () => {
    navigate(`/groups/${groupId}`)
  }

  return (
    <div className="bg-white border border-outline-variant/10 shadow-sm w-full max-w-full overflow-x-hidden">
      {error && (
        <div role="alert" className="p-3 bg-error-container/30 border-b border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="text-left border-collapse border border-outline-variant/20" style={{ width: '100%', minWidth: `${Math.max(700, 200 + sessions.length * 160)}px` }} aria-label="Attendance grid">
          <caption className="sr-only">Student attendance for {groupName || 'group'} — Level {level}</caption>
          {/* Group Header Row */}
          {groupName && (
            <thead>
              <tr className="bg-slate-50">
                  <th colSpan={sessions.length + 1} className="p-0 border-b border-outline-variant/20">
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
                          aria-label="View group details"
                        >
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">info</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
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
                      
                      <div className="h-8 w-px bg-slate-300"></div>
                      
                      {roster && roster.length > 0 && (
                        <>
                          <PaymentSummaryStrip roster={roster} />
                          <div className="h-8 w-px bg-slate-300"></div>
                        </>
                      )}
                      
                      <button
                        onClick={() => setIsAddSessionOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                        Add Session
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
          )}

          <AttendanceHeader sessions={sessions} groupInstructorName={groupInstructorName} />
          
          {/* Session Actions Row */}
          <tbody className="border-b border-outline-variant/20">
            <SessionActionsRow 
              sessions={sessions} 
              onEdit={handleEditSession}
              onCancel={handleCancelSession}
              onDelete={handleDeleteSession}
              onReactivate={handleReactivateSession}
              onComplete={handleCompleteSession}
              disabled={isSaving}
            />
          </tbody>

          <AttendanceTableBody
            students={students}
            sessions={sessions}
            onToggle={handleToggle}
          />
          
          {/* Session Notes Row */}
          <tbody className="border-t border-outline-variant/20">
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
        hasChanges={hasChanges || pendingChanges.size > 0 || dirtyNotes.size > 0}
        saveStatus={sessionSaveStatus}
        onRetrySession={handleRetrySession}
        dirtySessions={dirtySessions}
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
      
      {/* Add Session Modal */}
      <AddSessionDialog
        isOpen={isAddSessionOpen}
        groupId={groupId}
        levelNumber={level}
        sessions={sessions}
        groupInstructorName={groupInstructorName}
        onClose={() => {
          setIsAddSessionOpen(false)
          // We need to invalidate queries after adding to make the new session appear immediately
          qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
          refetchData()
        }}
      />
      
      {ToastComponent}
    </div>
  )
}
