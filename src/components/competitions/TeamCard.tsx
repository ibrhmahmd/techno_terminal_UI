import { useNavigate } from 'react-router-dom'
import type { TeamCardData } from '../../api/teams/types'

interface TeamCardProps {
  team: TeamCardData
}

export function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate()

  const paidCount = team.paidCount
  const totalCount = team.memberCount

  return (
    <div
      onClick={() => navigate(`/teams/${team.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/teams/${team.id}`) } }}
      role="button"
      tabIndex={0}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-secondary/30 cursor-pointer transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-secondary" aria-hidden="true">groups</span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-on-surface truncate">{team.team_name}</p>
          <p className="text-sm text-slate-500 truncate">
            {team.category}{team.subcategory ? ` — ${team.subcategory}` : ''}
          </p>
          {team.project_name && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">
              {team.project_name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {team.placement_rank != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <span className="material-symbols-outlined text-xs" aria-hidden="true">emoji_events</span>
                #{team.placement_rank}{team.placement_label ? ` · ${team.placement_label}` : ''}
              </span>
            )}
            {totalCount > 0 && (
              <span className={`text-xs font-medium ${
                paidCount === totalCount ? 'text-green-600' : paidCount > 0 ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {paidCount} of {totalCount} paid
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="material-symbols-outlined text-slate-400 flex-shrink-0 icon-flip-rtl" aria-hidden="true">chevron_right</span>
    </div>
  )
}
