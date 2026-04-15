import type { Session } from '../../api/academics'

interface SessionNotesRowProps {
  sessions: Session[]
  notes: Record<number, string>
  onNoteChange: (sessionId: number, value: string) => void
  disabled?: boolean
}

export function SessionNotesRow({ sessions, notes, onNoteChange, disabled }: SessionNotesRowProps) {
  const isCancelled = (session: Session) => session.status === 'cancelled'

  return (
    <tr className="bg-surface-container-lowest border-t-2 border-slate-400">
      {/* Empty student cell */}
      <td className="px-6 py-3 border-b-2 border-slate-400 border-r-2 border-slate-300 bg-slate-50">
        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-[0.2em]">
          Session Notes
        </span>
      </td>

      {sessions.map((session) => {
        const cancelled = isCancelled(session)

        return (
          <td
            key={`notes-${session.id}`}
            className={`px-4 py-3 border-l-2 border-b-2 border-slate-300 ${
              cancelled ? 'opacity-50 blur-[1px] bg-gray-100' : ''
            }`}
          >
            <textarea
              value={notes[session.id] || ''}
              onChange={(e) => onNoteChange(session.id, e.target.value)}
              placeholder={cancelled ? 'Session cancelled' : 'Add session notes...'}
              disabled={disabled || cancelled}
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
            />
          </td>
        )
      })}
    </tr>
  )
}
