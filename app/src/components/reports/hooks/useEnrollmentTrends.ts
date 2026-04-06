import { useState, useEffect, useCallback } from 'react'
import { getEnrollmentTrends, type EnrollmentTrend } from '../../../api/reports'

interface UseEnrollmentTrendsResult {
  trends: EnrollmentTrend[]
  isLoading: boolean
  error: Error | null
  refetch: (months?: number) => void
  isUsingMockData: boolean
}

const MOCK_TRENDS: EnrollmentTrend[] = [
  { month: 'Jan', new_enrollments: 12, transfers: 3, drops: 2, net_change: 13 },
  { month: 'Feb', new_enrollments: 15, transfers: 2, drops: 1, net_change: 16 },
  { month: 'Mar', new_enrollments: 18, transfers: 4, drops: 3, net_change: 19 },
  { month: 'Apr', new_enrollments: 14, transfers: 1, drops: 2, net_change: 13 },
  { month: 'May', new_enrollments: 20, transfers: 3, drops: 1, net_change: 22 },
  { month: 'Jun', new_enrollments: 16, transfers: 2, drops: 4, net_change: 14 },
]

export function useEnrollmentTrends(months = 6, fallbackToMock = true): UseEnrollmentTrendsResult {
  const [trends, setTrends] = useState<EnrollmentTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [currentMonths, setCurrentMonths] = useState(months)

  const fetchData = useCallback(async (fetchMonths = currentMonths) => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const data = await getEnrollmentTrends(fetchMonths)
      setTrends(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch enrollment trends')
      setError(errorObj)
      
      if (fallbackToMock) {
        setTrends(MOCK_TRENDS)
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
    trends,
    isLoading,
    error,
    refetch,
    isUsingMockData
  }
}
