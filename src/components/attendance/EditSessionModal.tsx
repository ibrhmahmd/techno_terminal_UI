import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, PillSelector, SearchablePillSelector } from '../common'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { UpdateSessionDTO } from '../../api/academics'
import type { SessionWithAttendanceDTO } from '../../api/dashboard'
import { useEmployees } from '../../hooks/useEmployees'

interface EditSessionPopupProps {
  isOpen: boolean
  onClose: () => void
  session: SessionWithAttendanceDTO | null
  onSave: (sessionId: number, updates: UpdateSessionDTO) => void
}

export function EditSessionPopup({ isOpen, onClose, session, onSave }: EditSessionPopupProps) {
  const { t } = useTranslation('attendance')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedInstructorId, setSelectedInstructorId] = useState<number>(0)
  const [originalInstructorId, setOriginalInstructorId] = useState<number>(0)
  const [isSubstitute, setIsSubstitute] = useState(false)
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load instructors via useEmployees hook
  const { employees: instructors } = useEmployees(isOpen)

  const instructorOptions = instructors.map((inst) => ({
    id: inst.id,
    label: inst.full_name,
    subLabel: inst.job_title || t('edit.instructor'),
  }))

  const statusOptions = [
    { value: 'scheduled', label: t('edit.scheduled'), dotColor: 'bg-blue-500' },
    { value: 'completed', label: t('edit.completed'), dotColor: 'bg-green-500' },
    { value: 'cancelled', label: t('edit.cancelled'), dotColor: 'bg-red-500' },
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

  // Reset form when session changes
  useEffect(() => {
    if (session) {
      setDate(session.date || session.session_date || '')
      setStartTime(session.time_start || session.start_time || '')
      setEndTime(session.time_end || session.end_time || '')
      setSelectedInstructorId(session.actual_instructor_id || 0)
      setOriginalInstructorId(session.actual_instructor_id || 0)
      setIsSubstitute(session.is_substitute || false)
      setStatus(session.status)
      setNotes(session.notes || '')
    }
  }, [session])

  // Handle instructor change - auto-set is_substitute if different from original
  const handleInstructorChange = (instructorId: number) => {
    setSelectedInstructorId(instructorId)
    setIsSubstitute(instructorId !== originalInstructorId)
  }

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
    if (!session) return

    setIsLoading(true)
    try {
      const sessionId = session.session_id || session.id
      await onSave(sessionId, {
        session_date: date,
        start_time: startTime,
        end_time: endTime,
        actual_instructor_id: selectedInstructorId,
        is_substitute: isSubstitute,
        status: status,
        notes
      })
      onClose()
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setIsLoading(false)
    }
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
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">{t('edit.hours')}</span>
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
      onClose={onClose}
      title={t('edit.title')}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            {t('edit.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-secondary rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : null}
            {t('edit.save_changes')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Date & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5">
            <label htmlFor="session-date" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('edit.date')}</label>
            <input
              id="session-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-md text-sm text-slate-800 bg-white focus:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/50 focus:outline-none transition-all"
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
                {t('edit.today')}
              </button>
              <button
                type="button"
                onClick={() => adjustDate(1)}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                {t('edit.plus_1_day')}
              </button>
              <button
                type="button"
                onClick={() => adjustDate(7)}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                {t('edit.plus_7_days')}
              </button>
            </div>
          </div>
          <div className="lg:col-span-7">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('edit.status')}</label>
            <PillSelector
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as 'scheduled' | 'completed' | 'cancelled')}
            />
          </div>
        </div>

        {/* Row 2: Start Time & End Time Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderTimeGrid(t('edit.start_time'), startTime, setStartTime)}
          {renderTimeGrid(t('edit.end_time'), endTime, setEndTime)}
        </div>

        {/* Row 3: Instructor Selection & Substitute Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('edit.instructor')}</label>
            <SearchablePillSelector
              options={instructorOptions}
              value={selectedInstructorId || null}
              onChange={(val) => handleInstructorChange(val ? Number(val) : 0)}
              placeholder={t('edit.search_instructors')}
            />
          </div>
          {/* iOS Switch Toggle for Substitute */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-md h-[46px]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">{t('edit.substitute')}</span>
              <span className="text-[10px] text-slate-400">{t('edit.substitute_hint')}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isSubstitute}
              aria-label="Substitute Instructor"
              onClick={() => setIsSubstitute((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 ${
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
          <label htmlFor="session-notes" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('edit.notes_optional')}</label>
          <textarea
            id="session-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('edit.notes_placeholder')}
            rows={3}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-md text-sm text-slate-800 bg-white focus:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/50 focus:outline-none transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}
