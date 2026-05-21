import { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { TeamCard } from './TeamCard'
import { TeamGroupBySelector } from './TeamGroupBySelector'
import { TeamCategoryFilter } from './TeamCategoryFilter'
import { groupTeams } from './utils/groupTeams'
import type { TeamCardData, TeamGroupByField } from '../../api/teams/types'

interface TeamsTabProps {
  teams: TeamCardData[]
  categories: string[]
  isLoading: boolean
  onRegisterTeam: () => void
}

const GROUP_BY_KEY = 'tt:competitions:groupBy'
const SUBGROUP_BY_KEY = 'tt:competitions:subgroupBy'

function loadPreference(key: string): TeamGroupByField | null | undefined {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return undefined
    if (stored === 'null') return null
    return stored as TeamGroupByField
  } catch {
    return undefined
  }
}

function savePreference(key: string, value: TeamGroupByField | null) {
  try {
    localStorage.setItem(key, value === null ? 'null' : value)
  } catch {
    // localStorage not available
  }
}

export function TeamsTab({ teams, categories, isLoading, onRegisterTeam }: TeamsTabProps) {
  const [groupBy, setGroupByState] = useState<TeamGroupByField | null | undefined>(() => loadPreference(GROUP_BY_KEY))
  const [subgroupBy, setSubgroupByState] = useState<TeamGroupByField | null | undefined>(() => loadPreference(SUBGROUP_BY_KEY))
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const setGroupBy = (field: TeamGroupByField | null) => {
    setGroupByState(field)
    savePreference(GROUP_BY_KEY, field)
  }

  const setSubgroupBy = (field: TeamGroupByField | null) => {
    setSubgroupByState(field)
    savePreference(SUBGROUP_BY_KEY, field)
  }

  const effectiveGroupBy = groupBy === undefined ? null : groupBy
  const effectiveSubgroupBy = subgroupBy === undefined ? null : subgroupBy

  const filteredTeams = categoryFilter
    ? teams.filter(t => t.category === categoryFilter)
    : teams

  const groups = groupTeams(filteredTeams, effectiveGroupBy, effectiveSubgroupBy)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-slate-500 font-medium">{filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}</span>
          <TeamCategoryFilter
            categories={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>
        <TeamGroupBySelector
          groupBy={effectiveGroupBy}
          onGroupByChange={setGroupBy}
          subgroupBy={effectiveSubgroupBy}
          onSubgroupByChange={setSubgroupBy}
        />
      </div>

      {/* Team cards */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-400" aria-hidden="true">groups</span>
          </div>
          <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">
            {categoryFilter ? 'No teams match this filter' : 'No teams registered yet'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {categoryFilter
              ? 'Try selecting a different category or clearing the filter.'
              : 'Register your first team to get started with this competition.'}
          </p>
          {!categoryFilter && (
            <button
              onClick={onRegisterTeam}
              className="px-6 py-2.5 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors shadow-sm"
            >
              Register First Team
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-headline font-semibold text-on-surface mb-3 flex items-center gap-2">
                {group.label}
                <span className="text-sm font-normal text-slate-400">({group.count})</span>
              </h3>
              {'subgroups' in group && (group as { subgroups?: Array<{ key: string; label: string; count: number; teams: TeamCardData[] }> }).subgroups ? (
                <div className="space-y-4">
                  {(group as { subgroups: Array<{ key: string; label: string; count: number; teams: TeamCardData[] }> }).subgroups.map((sub) => (
                    <div key={sub.key}>
                      <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
                        {sub.label}
                        <span className="text-xs text-slate-400">({sub.count})</span>
                      </h4>
                      <div className="space-y-2">
                        {sub.teams.map((team) => (
                          <TeamCard key={team.id} team={team} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {group.teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
