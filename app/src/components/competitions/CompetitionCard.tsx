import type { Competition } from '../../api/competitions'
import { formatDate } from '../../utils/formatting'
import { competitionStatusColors } from '../../utils/colors'

interface CompetitionCardProps {
  competition: Competition
  onClick: () => void
}

export function CompetitionCard({ competition, onClick }: CompetitionCardProps) {
  const isRegistrationOpen = () => {
    const now = new Date()
    const deadline = new Date(competition.registration_deadline)
    return now <= deadline && competition.status === 'upcoming'
  }

  return (
    <div
      onClick={onClick}
      className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-lg font-semibold text-on-surface">{competition.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{competition.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${competitionStatusColors[competition.status]}`}>
          {competition.status}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{competition.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400">event</span>
          <span>{formatDate(competition.start_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400">group</span>
          <span>{competition.registered_teams} teams</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400">person</span>
          <span>{competition.total_participants} participants</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400">payments</span>
          <span>{competition.fee_per_participant} EGP</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-sm text-slate-500">
          <span className="font-medium">Registration deadline:</span>{' '}
          {formatDate(competition.registration_deadline)}
        </div>
        {isRegistrationOpen() && (
          <span className="px-3 py-1 bg-secondary-container text-secondary text-xs rounded-full font-medium">
            Registration Open
          </span>
        )}
      </div>
    </div>
  )
}
