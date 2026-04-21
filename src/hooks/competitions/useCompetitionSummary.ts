import { useQuery } from '@tanstack/react-query'
import { getCompetitionSummary, type CompetitionSummaryResponse } from '../../api/competitions'
import { queryKeys } from '../queryKeys'

interface UseCompetitionSummaryReturn {
  summary: CompetitionSummaryResponse | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCompetitionSummary(id: number | null): UseCompetitionSummaryReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: id ? queryKeys.competitionSummary(id) : ['competitions', 'summary', 'empty'],
    queryFn: async () => {
      if (!id) return null
      const response = await getCompetitionSummary(id)
      return response
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    summary: data || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
  }
}
