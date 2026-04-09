import { useCallback } from 'react'
import type { AttendanceStatus } from '../../api/attendance'

interface AttendanceCellProps {
  status: AttendanceStatus
  onToggle: () => void
}

const ICONS = {
  present: (
    <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
  ),
  absent: (
    <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
      cancel
    </span>
  ),
  cancelled: (
    <span className="material-symbols-outlined text-slate-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
      block
    </span>
  ),
  empty: <div className="w-5 h-5 mx-auto border border-outline-variant/20 rounded-sm" />
}

export function AttendanceCell({ status, onToggle }: AttendanceCellProps) {
  const handleClick = useCallback(() => {
    onToggle()
  }, [onToggle])

  return (
    <button
      onClick={handleClick}
      className="w-full h-full flex items-center justify-center hover:bg-surface-container-low/50 rounded transition-colors py-2"
      aria-label={`Toggle attendance: ${status || 'empty'}`}
    >
      {status === 'present' ? ICONS.present :
       status === 'absent' ? ICONS.absent :
       status === 'cancelled' ? ICONS.cancelled : ICONS.empty}
    </button>
  )
}
