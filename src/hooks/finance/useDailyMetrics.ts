import { useQuery } from '@tanstack/react-query'
import { getDailyCollections, getUnpaidEnrollments } from '../../api/finance'
import { queryKeys } from '../queryKeys'
import type { UnpaidEnrollment } from '../../api/crm/students/types/finance'

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
      const limit = 200
      let allItems: UnpaidEnrollment[] = []
      let skip = 0
      let total = 0
      let hasMore = true

      while (hasMore) {
        const result = await getUnpaidEnrollments({ skip, limit })
        allItems = allItems.concat(result.items)
        total = result.total
        hasMore = result.hasMore
        skip += limit
      }

      return { items: allItems, total }
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
