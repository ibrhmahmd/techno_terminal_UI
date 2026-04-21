import { useQuery } from '@tanstack/react-query'
import { getDeletedCompetitions, type Competition } from '../../api/competitions'
import { queryKeys } from '../queryKeys'

interface UseDeletedCompetitionsReturn {
  competitions: Competition[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDeletedCompetitions(): UseDeletedCompetitionsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.competitionDeleted,
    queryFn: async () => {
      const response = await getDeletedCompetitions()
      return response
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  })

  return {
    competitions: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
