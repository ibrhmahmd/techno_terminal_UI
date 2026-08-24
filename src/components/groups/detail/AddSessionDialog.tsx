import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, PillSelector, SearchablePillSelector } from '../../common'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEmployees } from '../../../api/hr'
import type { EmployeeListItem } from '../../../api/hr'
import { addExtraSession, updateSession } from '../../../api/academics/sessions/core'
import { queryKeys } from '../../../hooks/queryKeys'
import type { SessionWithAttendanceDTO } from '../../../api/dashboard'
import { LoadingSpinner } from '../../common/LoadingSpinner'

interface AddSessionDialogProps {
  isOpen: boolean
  groupId: number
  levelNumber: number
  sessions?: SessionWithAttendanceDTO[]
  groupInstructorName?: string
  onClose: () => void
}

export function AddSessionDialog({
  isOpen,
  groupId,
  levelNumber,
  sessions,
  groupInstructorName,
  onClose
}: AddSessionDialogProps) {
  const { t } = useTranslation('groups')
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedInstructorId, setSelectedInstructorId] = useState<number>(0)
  const [isSubstitute, setIsSubstitute] = useState(false)
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load instructors via React Query
  const { data: instructorsData } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: () => getEmployees({ page: 1, page_size: 100 }),
    staleTime: 10 * 60 * 1000,
    enabled: isOpen,
  })
  const instructors: EmployeeListItem[] = instructorsData?.data ?? []

  const instructorOptions = instructors.map((inst) => ({
    id: inst.id,
    label: inst.full_name,
    subLabel: inst.job_title || 'Instructor',
  }))

  const statusOptions = [
    { value: 'scheduled', label: t('addSessionDialog.scheduled'), dotColor: 'bg-blue-500' },
    { value: 'completed', label: t('addSessionDialog.completed'), dotColor: 'bg-green-500' },
    { value: 'cancelled', label: t('addSessionDialog.cancelled'), dotColor: 'bg-red-500' },
  ]

  // Time conversion helpers
  const parseTimeTo12h = (time24: string) => {
    if (!time24) return { hour: '06', minute: '00', ampm: 'PM' }
    const [hStr, mStr] = time24.split(':')
    const h = parseInt(hStr, 10)
    const minute = mStr || '00'
    const ampm = h >= 12 ? 'PM' : 'AM'
    let h12 = h % 12
    if (h12 === 0) h12 = 12
    const hour = String(h12).padStart(2, '0')
    return { hour, minute, ampm }
  }

  const format12hTo24 = (hour: string, minute: string, ampm: string) => {
    let h = parseInt(hour, 10)
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${minute}`
  }

  // Pre-fill defaults from the last session or fallback to group instructor
  useEffect(() => {
    if (isOpen) {
      const sortedSessions = [...(sessions || [])].sort(
        (a, b) => (a.date || '').localeCompare(b.date || '')
      )
      const lastSession = sortedSessions[sortedSessions.length - 1]

      if (lastSession) {
        const lastDateStr = lastSession.date
        if (lastDateStr) {
          try {
            const lastDate = new Date(lastDateStr)
            const nextDate = new Date(lastDate)
            nextDate.setDate(lastDate.getDate() + 7)
            const year = nextDate.getFullYear()
            const month = String(nextDate.getMonth() + 1).padStart(2, '0')
            const day = String(nextDate.getDate()).padStart(2, '0')
            setDate(`${year}-${month}-${day}`)
          } catch {
            setDate('')
          }
        }
        setStartTime(lastSession.time_start || '18:00')
        setEndTime(lastSession.time_end || '20:00')
        setSelectedInstructorId(lastSession.actual_instructor_id || 0)
        setIsSubstitute(lastSession.is_substitute || false)
      } else {
        // Fallback to today
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        setDate(`${year}-${month}-${day}`)
        setStartTime('18:00')
        setEndTime('20:00')
        setIsSubstitute(false)
      }
    }
  }, [isOpen, sessions])

  // Try to match groupInstructorName with loaded instructors once loaded
  useEffect(() => {
    if (isOpen && instructors.length > 0 && selectedInstructorId === 0) {
      const sortedSessions = [...(sessions || [])].sort(
        (a, b) => (a.date || '').localeCompare(b.date || '')
      )
      const lastSession = sortedSessions[sortedSessions.length - 1]
      
      // Only match groupInstructorName if there's no last session pre-populating the instructor ID
      if (!lastSession && groupInstructorName) {
        const matched = instructors.find(
          (inst) => inst.full_name.toLowerCase().trim() === groupInstructorName.toLowerCase().trim()
        )
        if (matched) {
          setSelectedInstructorId(matched.id)
        }
      }
    }
  }, [isOpen, instructors, groupInstructorName, sessions, selectedInstructorId])

  const adjustDate = (days: number) => {
    const baseDate = date ? new Date(date) : new Date()
    baseDate.setDate(baseDate.getDate() + days)
    const year = baseDate.getFullYear()
    const month = String(baseDate.getMonth() + 1).padStart(2, '0')
    const day = String(baseDate.getDate()).padStart(2, '0')
    setDate(`${year}-${month}-${day}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!date) {
      setError(t('addSessionDialog.date_required'))
      return
    }

    try {
      setIsSubmitting(true)
      // 1. Create the session (only expects group_id, level_number, extra_date, notes)
      const newSession = await addExtraSession({
        group_id: groupId,
        level_number: levelNumber,
        extra_date: date,
        notes: notes || null
      })

      const newSessionId = newSession.id

      // 2. If additional details are provided, update the session immediately
      if (startTime || endTime || selectedInstructorId > 0 || isSubstitute || status !== 'scheduled') {
        await updateSession(newSessionId, {
          session_date: date,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          actual_instructor_id: selectedInstructorId > 0 ? selectedInstructorId : undefined,
          is_substitute: isSubstitute,
          status: status,
          notes: notes || null
        })
      }

      // Invalidate queries so the UI updates
      queryClient.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupSessions(groupId) })

      // Reset and close on success
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add session')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setDate('')
    setStartTime('')
    setEndTime('')
    setSelectedInstructorId(0)
    setIsSubstitute(false)
    setStatus('scheduled')
    setNotes('')
    onClose()
  }

  // Large Interactive Time Grid Selector Component
  const renderTimeGrid = (
    label: string,
    currentTime: string,
    setCurrentTime: (val: string) => void
  ) => {
    const { hour, minute, ampm } = parseTimeTo12h(currentTime)
    const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    const minutes = ['00', '15', '30', '45']
    const periods = ['AM', 'PM']

    return (
      <div className="flex flex-col gap-2">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}: <span className="font-extrabold text-secondary text-sm">{hour}:{minute} {ampm}</span>
        </label>
        <div className="p-3 bg-slate-50/50 border border-slate-200/60 rounded-md space-y-3">
          {/* Hours (Large buttons in 12h format) */}
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Hours</span>
            <div className="grid grid-cols-6 gap-1">
              {hours.map((h) => {
                const isSel = hour === h
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCurrentTime(format12hTo24(h, minute, ampm))}
                    className={`h-10 text-sm font-bold rounded-md border transition-all flex items-center justify-center ${
                      isSel
                        ? 'bg-secondary text-white border-secondary shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Minutes & Period row */}
          <div className="grid grid-cols-6 gap-1.5 pt-2 border-t border-slate-100">
            {/* Minutes (4 columns) */}
            {minutes.map((m) => {
              const isSel = minute === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCurrentTime(format12hTo24(hour, m, ampm))}
                  className={`h-10 text-xs font-bold rounded-md border transition-all flex items-center justify-center ${
                    isSel
                      ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  :{m}
                </button>
              )
            })}

            {/* Period Selection (2 columns) */}
            {periods.map((ap) => {
              const isSel = ampm === ap
              return (
                <button
                  key={ap}
                  type="button"
                  onClick={() => setCurrentTime(format12hTo24(hour, minute, ap))}
                  className={`h-10 text-xs font-extrabold rounded-md border transition-all flex items-center justify-center ${
                    isSel
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {ap}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('addSessionDialog.title')}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Row 1: Date & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5">
              <label htmlFor="session-date" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('addSessionDialog.session_date')} <span className="text-red-500">*</span>
              </label>
              <input
                id="session-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-md text-sm text-slate-800 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                required
              />
              <div className="flex gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const year = today.getFullYear()
                    const month = String(today.getMonth() + 1).padStart(2, '0')
                    const day = String(today.getDate()).padStart(2, '0')
                    setDate(`${year}-${month}-${day}`)
                  }}
                  className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  {t('addSessionDialog.today')}
                </button>
                <button
                  type="button"
                  onClick={() => adjustDate(1)}
                  className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  {t('addSessionDialog.plus_one_day')}
                </button>
                <button
                  type="button"
                  onClick={() => adjustDate(7)}
                  className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  {t('addSessionDialog.plus_seven_days')}
                </button>
              </div>
            </div>
            <div className="lg:col-span-7">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('addSessionDialog.status')}
              </label>
              <PillSelector
                options={statusOptions}
                value={status}
                onChange={(val) => setStatus(val as 'scheduled' | 'completed' | 'cancelled')}
              />
            </div>
          </div>

          {/* Row 2: Start Time & End Time Pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderTimeGrid(t('addSessionDialog.start_time'), startTime, setStartTime)}
            {renderTimeGrid(t('addSessionDialog.end_time'), endTime, setEndTime)}
          </div>

          {/* Row 3: Instructor Selection & Substitute Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('addSessionDialog.instructor')}
              </label>
              <SearchablePillSelector
                options={instructorOptions}
                value={selectedInstructorId || null}
                onChange={(val) => setSelectedInstructorId(val ? Number(val) : 0)}
                placeholder={t('addSessionDialog.search_instructors')}
              />
            </div>
            {/* iOS Switch Toggle for Substitute */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-md h-[46px]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">{t('addSessionDialog.substitute')}</span>
                <span className="text-[10px] text-slate-400">{t('addSessionDialog.substitute_desc')}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isSubstitute}
                aria-label="Toggle substitute instructor"
                onClick={() => setIsSubstitute((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
                  isSubstitute ? 'bg-secondary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSubstitute ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 4: Notes */}
          <div>
            <label htmlFor="session-notes" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('addSessionDialog.notes_optional')}
            </label>
            <textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-md text-sm text-slate-800 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all resize-none"
              rows={3}
              placeholder={t('addSessionDialog.notes_placeholder')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {t('addSessionDialog.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !date}
            className="px-4 py-2 text-sm font-bold text-white bg-secondary rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : null}
            {t('addSessionDialog.add_session')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
