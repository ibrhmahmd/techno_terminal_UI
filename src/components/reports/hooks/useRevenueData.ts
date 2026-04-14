import { useState, useEffect, useCallback } from 'react'
import { getRevenueMetrics, type RevenueMetricsDTO } from '../../../api/analytics'

interface UseRevenueDataResult {
  metrics: RevenueMetricsDTO | null
  isLoading: boolean
  error: Error | null
  refetch: (months?: number) => void
}

export function useRevenueData(): UseRevenueDataResult {
  const [metrics, setMetrics] = useState<RevenueMetricsDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // New analytics API doesn't take months parameter
      const data = await getRevenueMetrics()
      setMetrics(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch revenue metrics')
      setError(errorObj)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    metrics,
    isLoading,
    error,
    refetch
  }
}
