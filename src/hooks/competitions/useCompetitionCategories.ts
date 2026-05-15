import { useQuery } from '@tanstack/react-query'
import {
  getCompetitionCategories,
  type CategoryResponse,
} from '../../api/competitions'
import { queryKeys } from '../queryKeys'

interface UseCompetitionCategoriesReturn {
  categories: CategoryResponse[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCompetitionCategories(
  competitionId: number | string
): UseCompetitionCategoriesReturn {
  const numericId = typeof competitionId === 'string' ? (competitionId ? parseInt(competitionId, 10) : 0) : competitionId
  const isEnabled = !!numericId

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.competitionCategories(numericId),
    queryFn: async () => {
      const result = await getCompetitionCategories(numericId)
      return result
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  })

  return {
    categories: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
