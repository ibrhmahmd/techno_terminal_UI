import { useQuery } from '@tanstack/react-query'
import { getTeams, type TeamWithMembersDTO, type TeamCardData, type TeamListFilters } from '../../api/teams'
import { queryKeys } from '../queryKeys'

function toTeamCardData(item: TeamWithMembersDTO): TeamCardData {
  return {
    id: item.team.id,
    team_name: item.team.team_name,
    category: item.team.category,
    subcategory: item.team.subcategory ?? null,
    project_name: item.team.project_name,
    coach_id: item.team.coach_id ?? null,
    placement_rank: item.team.placement_rank ?? null,
    placement_label: item.team.placement_label ?? null,
    members: item.members,
    memberCount: item.members.length,
    paidCount: item.members.filter(m => m.amount_paid > 0).length,
  }
}

interface UseTeamsReturn {
  teams: TeamCardData[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useTeams(competitionId: number, filters?: Omit<TeamListFilters, 'competition_id'>): UseTeamsReturn {
  const queryFilters: TeamListFilters = {
    competition_id: competitionId,
    ...filters,
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.teamsByCompetition(competitionId, filters),
    queryFn: async () => getTeams(queryFilters),
    enabled: !!competitionId,
    staleTime: 3 * 60 * 1000,
  })

  return {
    teams: (data || []).map(toTeamCardData),
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
