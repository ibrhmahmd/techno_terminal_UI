import { useState, useEffect, useCallback } from 'react'
import { getRevenueMetrics, type RevenueMetricsDTO } from '../../../api/analytics'

interface UseRevenueDataResult {
  metrics: RevenueMetricsDTO | null
  isLoading: boolean
  error: Error | null
  refetch: (months?: number) => void
  isUsingMockData: boolean
}

const MOCK_REVENUE: RevenueMetricsDTO = {
  monthly_revenue: [
    { month: 'Jan', amount: 20000 },
    { month: 'Feb', amount: 22000 },
    { month: 'Mar', amount: 21000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 24000 },
    { month: 'Jun', amount: 28000 },
  ],
  total_collected: 140000,
  total_outstanding: 8000,
  collection_rate: 94.6,
  average_monthly: 23333,
}

export function useRevenueData(months = 6, fallbackToMock = true): UseRevenueDataResult {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [currentMonths, setCurrentMonths] = useState(months)

  const fetchData = useCallback(async (fetchMonths = currentMonths) => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const data = await getRevenueMetrics(fetchMonths)
      setMetrics(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch revenue metrics')
      setError(errorObj)
      
      if (fallbackToMock) {
        setMetrics(MOCK_REVENUE)
        setIsUsingMockData(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentMonths, fallbackToMock])

  useEffect(() => {
    fetchData(currentMonths)
  }, [fetchData, currentMonths])

  const refetch = useCallback((newMonths?: number) => {
    if (newMonths !== undefined && newMonths !== currentMonths) {
      setCurrentMonths(newMonths)
    } else {
      fetchData(currentMonths)
    }
  }, [currentMonths, fetchData])

  return {
    metrics,
    isLoading,
    error,
    refetch,
    isUsingMockData
  }
}
