import { useQuery } from '@tanstack/react-query'
import { getTeams, getTeamsWithMembers, type TeamDTO, type TeamListFilters, type TeamWithMembersDTO } from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamsReturn {
  teams: TeamDTO[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

interface UseTeamsWithMembersReturn {
  teams: TeamWithMembersDTO[]
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
    teams: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}

export function useTeamsWithMembers(competitionId: number, filters?: Omit<TeamListFilters, 'competition_id' | 'include_members'>): UseTeamsWithMembersReturn {
  const queryFilters: TeamListFilters = {
    competition_id: competitionId,
    include_members: true,
    ...filters,
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.teamsWithMembers(competitionId, filters),
    queryFn: async () => getTeamsWithMembers(queryFilters),
    enabled: !!competitionId,
    staleTime: 3 * 60 * 1000,
  })

  return {
    teams: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
