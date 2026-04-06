import { useState, useEffect, useCallback } from 'react'
import { getInstructorPerformance, type InstructorPerformanceReport } from '../../../api/reports'

interface UseInstructorPerformanceResult {
  instructors: InstructorPerformanceReport[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isUsingMockData: boolean
}

const MOCK_INSTRUCTOR_PERFORMANCE: InstructorPerformanceReport[] = [
  { 
    instructor_id: '1',
    instructor_name: 'Ali Mahmoud', 
    groups_count: 3, 
    total_students: 35,
    attendance_rate: 0.92,
    sessions_conducted: 45,
    sessions_cancelled: 2
  },
  { 
    instructor_id: '2',
    instructor_name: 'Sarah Ahmed', 
    groups_count: 2, 
    total_students: 28,
    attendance_rate: 0.88,
    sessions_conducted: 38,
    sessions_cancelled: 1
  },
  { 
    instructor_id: '3',
    instructor_name: 'Omar Hassan', 
    groups_count: 4, 
    total_students: 42,
    attendance_rate: 0.95,
    sessions_conducted: 52,
    sessions_cancelled: 0
  },
  { 
    instructor_id: '4',
    instructor_name: 'Fatima Ali', 
    groups_count: 2, 
    total_students: 24,
    attendance_rate: 0.90,
    sessions_conducted: 36,
    sessions_cancelled: 3
  },
]

export function useInstructorPerformance(fallbackToMock = true): UseInstructorPerformanceResult {
  const [instructors, setInstructors] = useState<InstructorPerformanceReport[]>([])
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
