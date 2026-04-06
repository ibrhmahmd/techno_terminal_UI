import { useState, useEffect, useCallback } from 'react'
import { getDashboardSummary, type DashboardSummaryPublic } from '../../../api/analytics'

interface UseDashboardDataResult {
  summary: DashboardSummaryPublic | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isUsingMockData: boolean
}

const MOCK_SUMMARY: DashboardSummaryPublic = {
  active_enrollments: 165,
  today_sessions_count: 8
}

export function useDashboardData(fallbackToMock = true): UseDashboardDataResult {
  const [summary, setSummary] = useState<DashboardSummaryPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch dashboard summary')
      setError(errorObj)
      
      if (fallbackToMock) {
        setSummary(MOCK_SUMMARY)
        setIsUsingMockData(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [fallbackToMock])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    summary,
    isLoading,
    error,
    refetch: fetchData,
    isUsingMockData
  }
}
