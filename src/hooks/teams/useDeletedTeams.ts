import { useQuery } from '@tanstack/react-query'
import { getDeletedTeams, type TeamDTO } from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseDeletedTeamsReturn {
  teams: TeamDTO[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDeletedTeams(competitionId?: number): UseDeletedTeamsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.teamDeleted,
    queryFn: async () => getDeletedTeams(competitionId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })

  return {
    teams: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
