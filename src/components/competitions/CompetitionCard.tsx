import type { Competition } from '../../api/competitions'
import { formatDate } from '../../utils/formatting'

interface CompetitionCardProps {
  competition: Competition
  onClick: () => void
}

export function CompetitionCard({ competition, onClick }: CompetitionCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      role="button"
      tabIndex={0}
      className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline text-lg font-semibold text-on-surface">{competition.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{competition.location ?? 'N/A'}</p>
        </div>
        {competition.edition && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {competition.edition}
          </span>
        )}
      </div>

      {competition.notes && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{competition.notes}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400" aria-hidden="true">event</span>
          <span>{competition.competition_date ? formatDate(competition.competition_date) : 'Date TBD'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400" aria-hidden="true">payments</span>
          <span>{competition.fee_per_student} EGP per student</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-sm text-slate-500">
          <span className="font-medium">Created:</span>{' '}
          {competition.created_at ? formatDate(competition.created_at) : 'N/A'}
        </div>
        <span className="px-3 py-1 bg-secondary-container text-secondary text-xs rounded-full font-medium">
          View Details
        </span>
      </div>
    </div>
  )
}
