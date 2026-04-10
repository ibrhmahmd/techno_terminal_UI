import { useState, useEffect, useCallback } from 'react'
import { getInstructorPerformance, type InstructorPerformanceDTO } from '../../../api/analytics'

interface UseInstructorPerformanceResult {
  instructors: InstructorPerformanceDTO[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isUsingMockData: boolean
}

const MOCK_INSTRUCTOR_PERFORMANCE: InstructorPerformanceDTO[] = [
  { 
    instructor_name: 'Ali Mahmoud', 
    active_groups: 3, 
    active_students: 35
  },
  { 
    instructor_name: 'Sarah Ahmed', 
    active_groups: 2, 
    active_students: 28
  },
  { 
    instructor_name: 'Omar Hassan', 
    active_groups: 4, 
    active_students: 42
  },
  { 
    instructor_name: 'Fatima Ali', 
    active_groups: 2, 
    active_students: 24
  },
]

export function useInstructorPerformance(fallbackToMock = true): UseInstructorPerformanceResult {
  const [instructors, setInstructors] = useState<InstructorPerformanceDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const data = await getInstructorPerformance()
      setInstructors(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch instructor performance')
      setError(errorObj)
      
      if (fallbackToMock) {
        setInstructors(MOCK_INSTRUCTOR_PERFORMANCE)
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
    instructors,
    isLoading,
    error,
    refetch: fetchData,
    isUsingMockData
  }
}
