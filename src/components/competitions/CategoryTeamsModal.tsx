import { Modal } from '../common/Modal'
import { useNavigate } from 'react-router-dom'
import type { CompetitionSummaryCategory } from '../../api/competitions'

interface CategoryTeamsModalProps {
  category: CompetitionSummaryCategory | null
  isOpen: boolean
  onClose: () => void
}

export function CategoryTeamsModal({ category, isOpen, onClose }: CategoryTeamsModalProps) {
  const navigate = useNavigate()

  if (!category) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Teams - ${category.category_name}`} size="lg">
      {category.teams.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">groups</span>
          <p className="text-slate-500">No teams in this category yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {category.teams.map(({ team, members }) => (
            <div
              key={team.id}
              onClick={() => { navigate(`/teams/${team.id}`); onClose() }}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">groups</span>
                </div>
                <div>
                  <p className="font-medium text-on-surface">{team.team_name}</p>
                  <p className="text-sm text-slate-500">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                    {team.placement_rank ? ` · Rank #${team.placement_rank}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-on-surface">{team.fee} EGP</span>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
