import { useQuery } from '@tanstack/react-query'
import { getRevenueMetrics, type RevenueMetricsDTO } from '../../../api/analytics'
import { queryKeys } from '../../../hooks/queryKeys'
import { useState } from 'react'

interface UseRevenueDataResult {
  metrics: RevenueMetricsDTO | null
  isLoading: boolean
  error: Error | null
  refetch: (months?: number) => void
}

export function useRevenueData(initialMonths?: number): UseRevenueDataResult {
  const [months, setMonths] = useState<number | undefined>(initialMonths)

  const { data, isLoading, error, refetch } = useQuery<RevenueMetricsDTO>({
    queryKey: queryKeys.reports.revenue(months),
    queryFn: () => getRevenueMetrics(months),
    staleTime: 5 * 60 * 1000,
  })

  return {
    metrics: data ?? null,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch: async (newMonths?: number) => {
      if (newMonths !== undefined && newMonths !== months) {
        setMonths(newMonths)
      } else {
        await refetch()
      }
    },
  }
}
