import { useQuery } from '@tanstack/react-query'
import { getTeams, type TeamDTO, type TeamListFilters } from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamsReturn {
  teams: TeamDTO[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useTeams(filters?: TeamListFilters): UseTeamsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKeys.teams, filters],
    queryFn: async () => getTeams(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })

  return {
    teams: Array.isArray(data) ? data : [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
