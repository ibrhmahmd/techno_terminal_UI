import { useState, useEffect, useCallback } from 'react'
import { getDashboardSummary, type DashboardSummaryPublic } from '../../../api/analytics'

interface UseDashboardDataResult {
  summary: DashboardSummaryPublic | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useDashboardData(): UseDashboardDataResult {
  const [summary, setSummary] = useState<DashboardSummaryPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch dashboard summary')
      setError(errorObj)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    summary,
    isLoading,
    error,
    refetch: fetchData
  }
}
