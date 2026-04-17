import { useState, useEffect, useCallback } from 'react'
import { getInstructorPerformance, type InstructorPerformanceDTO } from '../../../api/analytics'

interface UseInstructorPerformanceResult {
  instructors: InstructorPerformanceDTO[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isUsingMockData: boolean
}

export function useInstructorPerformance(): UseInstructorPerformanceResult {
  const [instructors, setInstructors] = useState<InstructorPerformanceDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getInstructorPerformance()
      setInstructors(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch instructor performance')
      setError(errorObj)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    instructors,
    isLoading,
    error,
    refetch: fetchData,
    isUsingMockData: false
  }
}
