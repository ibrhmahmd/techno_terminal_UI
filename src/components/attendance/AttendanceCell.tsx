import { useCallback } from 'react'
import type { AttendanceStatus } from '../../api/attendance'

interface AttendanceCellProps {
  status: AttendanceStatus
  onToggle: () => void
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
  cancelled: (
    <span className="material-symbols-outlined text-slate-500 text-2xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
      block
    </span>
  ),
  empty: <div className="w-6 h-6 mx-auto border-2 border-slate-300 rounded-sm bg-white" />
}

export function AttendanceCell({ status, onToggle }: AttendanceCellProps) {
  const handleClick = useCallback(() => {
    onToggle()
  }, [onToggle])

  return (
    <button
      onClick={handleClick}
      className="w-full h-full flex items-center justify-center hover:bg-blue-100 rounded transition-colors py-3 focus:outline-none focus:ring-2 focus:ring-secondary/30"
      aria-label={`Toggle attendance: ${status || 'empty'}`}
    >
      {status === 'present' ? ICONS.present :
       status === 'absent' ? ICONS.absent :
       status === 'cancelled' ? ICONS.cancelled : ICONS.empty}
    </button>
  )
}
