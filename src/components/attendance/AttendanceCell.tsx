import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { AttendanceStatus } from '../../api/attendance'

interface AttendanceCellProps {
  status: AttendanceStatus
  onToggle: (studentId: string | number, sessionId: number) => void
  studentId: string | number
  sessionId: number
  disabled?: boolean
}

const ICONS = {
  present: (
    <span className="material-symbols-outlined text-green-600 text-2xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
  ),
  absent: (
    <span className="material-symbols-outlined text-red-600 text-2xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
      cancel
    </span>
  ),
  not_taken: (
    <span className="material-symbols-outlined text-slate-400 text-2xl" aria-hidden="true">
      radio_button_unchecked
    </span>
  ),
}

export const AttendanceCell = React.memo(function AttendanceCell({ status, onToggle, studentId, sessionId, disabled }: AttendanceCellProps) {
  const { t } = useTranslation('attendance')
  const handleClick = useCallback(() => {
    if (!disabled) {
      onToggle(studentId, sessionId)
    }
  }, [onToggle, studentId, sessionId, disabled])

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full h-full flex items-center justify-center hover:bg-secondary-container/30 rounded transition-colors py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
      aria-label={t('cell.toggle_aria', { status })}
    >
      {ICONS[status]}
    </button>
  )
})
