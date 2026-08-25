import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'
import type { AttendanceStatus, AttendanceEntry } from '../../api/attendance'
import { markAttendance } from '../../api/attendance'
import { queryKeys } from '../../hooks/queryKeys'
import { formatTime, formatInstructorName } from '../../utils/formatting'
import { sessionStatusColors } from '../../utils/colors'
import { useToast } from '../common/Toast'
import { PaymentSummaryStrip } from './PaymentSummaryStrip'

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
  const { t } = useTranslation('attendance')
  const qc = useQueryClient()
  const { showToast } = useToast()
  const [activeStep, setActiveStep] = useState<'sessions' | 'students'>('sessions')
  const [selectedSession, setSelectedSession] = useState<SessionWithAttendanceDTO | null>(null)
  
  const [localAttendance, setLocalAttendance] = useState<Map<number, AttendanceStatus>>(new Map())
  const [pendingEntries, setPendingEntries] = useState<AttendanceEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap + initial focus
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return
    const sheet = sheetRef.current
    const raf = requestAnimationFrame(() => sheet.focus())

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !sheet.contains(document.activeElement)) return
      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    sheet.addEventListener('keydown', handleTab)
    return () => {
      cancelAnimationFrame(raf)
      sheet.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

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
          const rawStatus = record.status ?? null
          initialMap.set(record.student_id, rawStatus === 'cancelled' || rawStatus === null ? 'not_taken' : rawStatus)
        })
      }
      setLocalAttendance(initialMap)
      setPendingEntries([])
    }
  }, [selectedSession])

  const handleStudentTap = (studentId: number) => {
    setLocalAttendance(prev => {
      const next = new Map(prev)
      const currentStatus = next.get(studentId) ?? 'not_taken'
      let nextStatus: AttendanceStatus = 'not_taken'

      if (currentStatus === 'not_taken') nextStatus = 'present'
      else if (currentStatus === 'present') nextStatus = 'absent'
      else if (currentStatus === 'absent') nextStatus = 'not_taken'

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
      // Invalidate both dashboard and group attendance caches in parallel
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) }),
        qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, selectedSession.level_number ?? -1) }),
      ])
      showToast(t('toast.attendance_saved'), 'success')
      setPendingEntries([])
      setActiveStep('sessions')
      onClose() // or keep it open at sessions view, let's close it to reflect completion
    } catch (err) {
      showToast(t('toast.attendance_save_failed'), 'error')
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
        className="fixed inset-0 bg-black/60 z-[60] transition-opacity lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('grid.grid_caption', { group: groupName, level: '' })}
        tabIndex={-1}
        className="fixed inset-x-0 bottom-0 z-[60] bg-surface rounded-t-2xl shadow-2xl lg:hidden flex flex-col max-h-[90vh] motion-reduce:transition-none transition-transform duration-300 translate-y-0"
      >
        
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0" aria-hidden="true">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            {activeStep === 'students' && (
              <button 
                onClick={() => setActiveStep('sessions')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                aria-label={t('mobile.back_to_sessions')}
              >
                <span className="material-symbols-outlined text-xl icon-flip-rtl" aria-hidden="true">arrow_back</span>
              </button>
            )}
            <div>
              <h2 className="font-headline font-bold text-slate-900 text-lg leading-tight">{groupName}</h2>
              {activeStep === 'sessions' ? (
                <p className="text-sm text-slate-500 font-medium">{t('mobile.select_session')}</p>
              ) : (
                <p className="text-sm text-slate-500 font-medium">
                  Session {selectedSession?.session_number} • {selectedSession?.time_start ? formatTime(selectedSession.time_start) : ''}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full" aria-label={t('mobile.close_sheet')}>
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Payment Summary */}
        {activeStep === 'students' && roster && roster.length > 0 && (
          <PaymentSummaryStrip roster={roster} className="px-5 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0" />
        )}

        {/* Content Area — grows and scrolls, shrink-0 footer sits below */}
        <div className="overflow-y-auto flex-1 overscroll-contain" aria-live="polite">
          {activeStep === 'sessions' ? (
            <div className="divide-y divide-slate-100 pb-20">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">{t('mobile.no_sessions')}</div>
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
                      className={`w-full flex items-center p-4 text-start transition-colors ${
                        isCancelled ? 'opacity-50 cursor-not-allowed' : 'active:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-headline font-bold text-lg shrink-0 me-4">
                        {String(session.session_number).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-slate-900 ${isCancelled ? 'line-through text-slate-500' : ''}`}>
                            {session.date}
                          </span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 uppercase">{t('mobile.today')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                          <span>{session.time_start ? formatTime(session.time_start) : t('mobile.no_time')}</span>
                          <span>•</span>
                          <span className="truncate" title={session.instructor_name || instructorName || 'TBA'}>
                            {formatInstructorName(session.instructor_name || instructorName || 'TBA')}
                          </span>
                        </div>
                      </div>
                      
                      {isCancelled ? (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${sessionStatusColors.cancelled}`}>{t('actions.cancelled')}</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 icon-flip-rtl" aria-hidden="true">chevron_right</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {roster.map(student => {
                const status = localAttendance.get(student.student_id) ?? 'absent'
                const statusConfig = {
                  present: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'check_circle', label: t('status.present') },
                  absent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'cancel', label: t('status.absent') },
                  not_taken: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', icon: 'radio_button_unchecked', label: t('status.not_taken') },
                }
                const conf = statusConfig[status]
                const isDue = student.billing_status === 'due'

                return (
                  <div key={student.student_id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0 pe-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        student.gender === 'male' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          {student.gender === 'male' ? 'face' : 'face_3'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 truncate">{student.student_name}</p>
                          {isDue ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-error bg-error-container px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 animate-fadeIn motion-reduce:animate-none">
                              <span className="material-symbols-outlined text-[10px] font-bold text-error" aria-hidden="true">close</span>
                              <span>
                                {student.balance !== undefined && student.balance > 0
                                  ? `${student.balance.toLocaleString()} EGP`
                                  : t('billing.due')}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-on-secondary-container bg-secondary-container px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 animate-fadeIn motion-reduce:animate-none">
                              <span className="material-symbols-outlined text-[10px] font-bold text-secondary" aria-hidden="true">check</span>
                              <span>{t('billing.paid')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStudentTap(student.student_id)}
                      className={`h-10 px-3 min-w-[100px] flex items-center justify-center gap-1.5 rounded-full border transition-colors ${conf.bg} ${conf.text} ${conf.border}`}
                    >
                      {conf.icon && <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{conf.icon}</span>}
                      <span className="text-sm font-bold">{conf.label || 'Mark...'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Save Footer for Step 2 — part of flex flow, never absolute */}
        {activeStep === 'students' && (
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <button
              onClick={handleSave}
              disabled={pendingEntries.length === 0 || isSaving}
              className="w-full h-12 bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin motion-reduce:animate-none" aria-hidden="true">refresh</span>
                  <span>{t('mobile.saving')}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" aria-hidden="true">save</span>
                  <span>{t('mobile.save_attendance')} {pendingEntries.length > 0 ? `(${pendingEntries.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
