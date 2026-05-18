import { useQuery } from '@tanstack/react-query'
import {
  getUnpaidCompetitionFees,
  type UnpaidCompFeeItem,
} from '../../api/finance'
import { queryKeys } from '../queryKeys'

export interface UseCompetitionFeesResult {
  unpaidFees: UnpaidCompFeeItem[]
  isLoading: boolean
  error: Error | null
}

export function useCompetitionFees(studentId: number): UseCompetitionFeesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.competitionFees(studentId),
    queryFn: () => getUnpaidCompetitionFees(studentId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  })

  return {
    unpaidFees: data || [],
    isLoading,
    error: error instanceof Error ? error : null,
  }
}
