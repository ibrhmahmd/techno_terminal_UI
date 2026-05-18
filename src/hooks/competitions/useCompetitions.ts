import { useQuery } from '@tanstack/react-query'
import { getCompetitions, type Competition } from '../../api/competitions'
import { queryKeys } from '../queryKeys'

interface UseCompetitionsReturn {
  competitions: Competition[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCompetitions(): UseCompetitionsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.competitions,
    queryFn: async () => getCompetitions(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    competitions: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
