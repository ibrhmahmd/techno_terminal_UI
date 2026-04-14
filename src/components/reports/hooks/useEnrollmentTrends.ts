import { useState, useEffect, useCallback } from 'react'
import { getEnrollmentTrends, type EnrollmentTrendDTO } from '../../../api/analytics'

interface UseEnrollmentTrendsResult {
  trends: EnrollmentTrendDTO[]
  isLoading: boolean
  error: Error | null
  refetch: (months?: number) => void
}

export function useEnrollmentTrends(months = 6): UseEnrollmentTrendsResult {
  const [trends, setTrends] = useState<EnrollmentTrendDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentMonths, setCurrentMonths] = useState(months)

  const fetchData = useCallback(async (fetchMonths = currentMonths) => {
    setIsLoading(true)
    setError(null)

    try {
      // Transform months to cutoff date (new API uses date string instead of months)
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - fetchMonths)
      const cutoff = cutoffDate.toISOString().split('T')[0]
      
      const data = await getEnrollmentTrends(cutoff)
      setTrends(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch enrollment trends')
      setError(errorObj)
    } finally {
      setIsLoading(false)
    }
  }, [currentMonths])

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
    refetch
  }
}
