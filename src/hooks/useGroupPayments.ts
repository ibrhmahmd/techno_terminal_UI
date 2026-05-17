import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import {
  getGroupPayments,
  type GroupPaymentsResponse,
  type LevelPaymentsDTO,
} from '../api/academics'

interface UseGroupPaymentsReturn {
  summary: GroupPaymentsResponse['summary'] | null
  paymentsByLevel: LevelPaymentsDTO[]
  totalExpected: number
  totalCollected: number
  totalDue: number
  collectionRate: number
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useGroupPayments(groupId: number): UseGroupPaymentsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.groupPayments(groupId),
    queryFn: () => getGroupPayments(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const summary = data?.summary ?? null
  const paymentsByLevel = data?.by_level ?? []

  return {
    summary,
    paymentsByLevel,
    totalExpected: summary?.total_expected_all_levels ?? 0,
    totalCollected: summary?.total_collected_all_levels ?? 0,
    totalDue: summary?.total_due_all_levels ?? 0,
    collectionRate: summary?.collection_rate ?? 0,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => void refetch(),
  }
}
