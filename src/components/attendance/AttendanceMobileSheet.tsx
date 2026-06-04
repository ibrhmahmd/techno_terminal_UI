import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'
import type { AttendanceStatus, AttendanceEntry } from '../../api/attendance'
import { markAttendance } from '../../api/attendance'
import { dashboardKeys } from '../../hooks/dashboard'
import { formatTime } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'
import { useToast } from '../common/Toast'

export interface AttendanceMobileSheetProps {
  isOpen: boolean
  groupId: number
  groupName: string
  instructorName: string
  sessions: SessionWithAttendanceDTO[]
  roster: StudentRosterDTO[]
  selectedDate: string
  onClose: () => void
}

export function AttendanceMobileSheet({
  isOpen,
  groupId,
  groupName,
  instructorName,
  sessions,
  roster,
  selectedDate,
  onClose
}: AttendanceMobileSheetProps) {
  const qc = useQueryClient()
  const { showToast } = useToast()
  const [activeStep, setActiveStep] = useState<'sessions' | 'students'>('sessions')
  const [selectedSession, setSelectedSession] = useState<SessionWithAttendanceDTO | null>(null)
  
  const [localAttendance, setLocalAttendance] = useState<Map<number, AttendanceStatus>>(new Map())
  const [pendingEntries, setPendingEntries] = useState<AttendanceEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when opened/closed or group changes
  useEffect(() => {
    setActiveStep('sessions')
    setSelectedSession(null)
    setLocalAttendance(new Map())
    setPendingEntries([])
  }, [isOpen, groupId])

  // Initialize local attendance when a session is selected
  useEffect(() => {
    if (selectedSession) {
      const initialMap = new Map<number, AttendanceStatus>()
      if (selectedSession.attendance) {
        selectedSession.attendance.forEach(record => {
          initialMap.set(record.student_id, record.status)
        })
      }
      setLocalAttendance(initialMap)
      setPendingEntries([])
    }
  }, [selectedSession])

  const handleStudentTap = (studentId: number) => {
    setLocalAttendance(prev => {
      const next = new Map(prev)
      const currentStatus = next.get(studentId)
      let nextStatus: AttendanceStatus = null

      if (currentStatus === null || currentStatus === undefined) nextStatus = 'present'
      else if (currentStatus === 'present') nextStatus = 'absent'
      else if (currentStatus === 'absent') nextStatus = 'cancelled'
      else if (currentStatus === 'cancelled') nextStatus = null

      next.set(studentId, nextStatus)

      setPendingEntries(currentEntries => {
        const existingIdx = currentEntries.findIndex(e => e.student_id === studentId.toString())
        const newEntry = { student_id: studentId.toString(), status: nextStatus }
        
        if (existingIdx >= 0) {
          const updated = [...currentEntries]
          updated[existingIdx] = newEntry
          return updated
        }
        return [...currentEntries, newEntry]
      })

      return next
    })
  }

  const handleSave = async () => {
    if (!selectedSession || pendingEntries.length === 0) return
    
    setIsSaving(true)
    try {
      await markAttendance(selectedSession.session_id, pendingEntries)
      // Invalidate dashboard to refresh data
      qc.invalidateQueries({ queryKey: dashboardKeys.overview(selectedDate) })
      showToast('Attendance saved successfully', 'success')
      setPendingEntries([])
      setActiveStep('sessions')
      onClose() // or keep it open at sessions view, let's close it to reflect completion
    } catch (err) {
      showToast('Failed to save attendance', 'error')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 z-50 transition-opacity lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-2xl shadow-2xl lg:hidden flex flex-col max-h-[90vh] transition-transform duration-300 translate-y-0">
        
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            {activeStep === 'students' && (
              <button 
                onClick={() => setActiveStep('sessions')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            )}
            <div>
              <h2 className="font-headline font-bold text-slate-900 text-lg leading-tight">{groupName}</h2>
              {activeStep === 'sessions' ? (
                <p className="text-sm text-slate-500 font-medium">Select a session</p>
              ) : (
                <p className="text-sm text-slate-500 font-medium">
                  Session {selectedSession?.session_number} • {selectedSession?.time_start ? formatTime(selectedSession.time_start) : ''}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {activeStep === 'sessions' ? (
            <div className="divide-y divide-slate-100">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No sessions available.</div>
              ) : (
                sessions.map(session => {
                  const isCancelled = session.status === 'cancelled'
                  const isToday = session.date === selectedDate
                  
                  return (
                    <button
                      key={session.session_id}
                      onClick={() => {
                        if (!isCancelled) {
                          setSelectedSession(session)
                          setActiveStep('students')
                        }
                      }}
                      disabled={isCancelled}
                      className={`w-full flex items-center p-4 text-left transition-colors ${
                        isCancelled ? 'opacity-50 cursor-not-allowed' : 'active:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-headline font-bold text-lg shrink-0 mr-4">
                        {String(session.session_number).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-slate-900 ${isCancelled ? 'line-through text-slate-500' : ''}`}>
                            {session.date}
                          </span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 uppercase">Today</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                          <span>{session.time_start ? formatTime(session.time_start) : 'No time'}</span>
                          <span>•</span>
                          <span className="truncate">{session.instructor_name || instructorName || 'TBA'}</span>
                        </div>
                      </div>
                      
                      {isCancelled ? (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${sessionStatusColors.cancelled}`}>CANCELLED</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 pb-24">
              {roster.map(student => {
                const status = localAttendance.get(student.student_id)
                const statusConfig = {
                  present: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'check', label: 'Present' },
                  absent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'close', label: 'Absent' },
                  cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: 'remove', label: 'Cancelled' },
                  null: { bg: 'bg-transparent', text: 'text-slate-400', border: 'border-slate-200 border-dashed', icon: '', label: '' }
                }
                const conf = status ? statusConfig[status] : statusConfig.null
                const isDue = student.billing_status === 'due'

                return (
                  <div key={student.student_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        student.gender === 'male' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {student.gender === 'male' ? 'face' : 'face_3'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 truncate">{student.student_name}</p>
                          {isDue && (
                            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Payment Due" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStudentTap(student.student_id)}
                      className={`h-10 px-3 min-w-[100px] flex items-center justify-center gap-1.5 rounded-full border transition-colors ${conf.bg} ${conf.text} ${conf.border}`}
                    >
                      {conf.icon && <span className="material-symbols-outlined text-[18px]">{conf.icon}</span>}
                      <span className="text-sm font-bold">{conf.label || 'Mark...'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Save Footer for Step 2 */}
        {activeStep === 'students' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shrink-0">
            <button
              onClick={handleSave}
              disabled={pendingEntries.length === 0 || isSaving}
              className="w-full h-12 bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Save Attendance {pendingEntries.length > 0 ? `(${pendingEntries.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
