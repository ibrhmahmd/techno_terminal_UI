import { Modal } from '../common/Modal'
import { useNavigate } from 'react-router-dom'
import type { CategoryWithTeamsDTO } from '../../api/competitions'

interface CategoryTeamsModalProps {
  category: CategoryWithTeamsDTO | null
  isOpen: boolean
  onClose: () => void
}

export function CategoryTeamsModal({ category, isOpen, onClose }: CategoryTeamsModalProps) {
  const navigate = useNavigate()

  if (!category) return null

  const title = `${category.category}${category.subcategory ? ` — ${category.subcategory}` : ''}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Teams - ${title}`} size="lg">
      {category.teams.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2" aria-hidden="true">groups</span>
          <p className="text-slate-500">No teams in this category yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {category.teams.map(({ team, members }) => (
            <div
              key={team.id}
              onClick={() => { navigate(`/teams/${team.id}`); onClose() }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/teams/${team.id}`); onClose() } }}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary" aria-hidden="true">groups</span>
                </div>
                <div>
                  <p className="font-medium text-on-surface">{team.team_name}</p>
                  <p className="text-sm text-slate-500">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                    {team.placement_rank ? ` · Rank #${team.placement_rank}` : ''}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400" aria-hidden="true">chevron_right</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
