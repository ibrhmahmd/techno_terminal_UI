import { useQuery } from '@tanstack/react-query'
import { getDailyCollections, getUnpaidEnrollments } from '../../api/finance'
import { queryKeys } from '../queryKeys'

export interface UseDailyMetricsResult {
  totalCollected: number
  totalReceipts: number
  unpaidCount: number
  unpaidAmount: number
  isLoading: boolean
  error: Error | null
}

export function useDailyMetrics(date: string): UseDailyMetricsResult {
  const collectionsQuery = useQuery({
    queryKey: queryKeys.finance.metrics(date),
    queryFn: () => getDailyCollections(date),
    staleTime: 2 * 60 * 1000,
  })

  const unpaidQuery = useQuery({
    queryKey: [...queryKeys.finance.metrics(date), 'unpaid'],
    queryFn: async () => {
      const result = await getUnpaidEnrollments({ skip: 0, limit: 1000 })
      return result
    },
    staleTime: 2 * 60 * 1000,
  })

  const collections = collectionsQuery.data ?? []
  const totalCollected = collections.reduce((sum, c) => sum + c.total_amount, 0)
  const totalReceipts = collections.reduce((sum, c) => sum + c.receipt_count, 0)

  const unpaidItems = unpaidQuery.data?.items ?? []
  const unpaidCount = unpaidQuery.data?.total ?? 0
  const unpaidAmount = unpaidItems.reduce((sum, e) => sum + e.remaining_balance, 0)

  const isLoading = collectionsQuery.isLoading || unpaidQuery.isLoading

  const error = collectionsQuery.error instanceof Error
    ? collectionsQuery.error
    : unpaidQuery.error instanceof Error
      ? unpaidQuery.error
      : null

  return {
    totalCollected,
    totalReceipts,
    unpaidCount,
    unpaidAmount,
    isLoading,
    error,
  }
}
