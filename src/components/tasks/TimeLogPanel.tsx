import { useState } from 'react'
import type { TaskTimeLogReadDTO } from '../../api/tasks'
import { useAddTimeLog } from '../../hooks/useTasks'
import { formatDate } from '../../utils/formatting'

interface TimeLogPanelProps {
  timeLogs: TaskTimeLogReadDTO[]
  taskId: string
  isAssigned: boolean
}

export function TimeLogPanel({ timeLogs, taskId, isAssigned }: TimeLogPanelProps) {
  const [hours, setHours] = useState('')
  const [note, setNote] = useState('')
  const addMutation = useAddTimeLog()

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0)

  const handleSubmit = () => {
    const parsed = parseFloat(hours)
    if (isNaN(parsed) || parsed <= 0) return
    addMutation.mutate({ taskId, hours: parsed, note: note.trim() || undefined }, {
      onSuccess: () => {
        setHours('')
        setNote('')
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">Total logged</span>
        <span className="text-sm font-semibold text-slate-900">{totalHours.toFixed(1)}h</span>
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {timeLogs.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No time logged yet</p>
        )}
        {timeLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm text-teal-600" aria-hidden="true">schedule</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{log.hours}h</span>
                <span className="text-xs text-slate-500">by {log.employee_name ?? 'Unknown'}</span>
              </div>
              {log.note && <p className="text-xs text-slate-500 mt-0.5">{log.note}</p>}
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{formatDate(log.logged_at)}</span>
          </div>
        ))}
      </div>

      {/* Add time log form */}
      {isAssigned && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hours"
              aria-label="Hours logged"
              min="0.5"
              step="0.5"
              className="w-24 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Optional note..."
              aria-label="Time log note"
              className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              onClick={handleSubmit}
              disabled={!hours || parseFloat(hours) <= 0 || addMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Log
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
