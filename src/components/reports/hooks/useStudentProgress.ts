import { useState, useEffect, useCallback } from 'react'
import { getStudentProgress, type StudentProgressDTO } from '../../../api/analytics'

interface UseStudentProgressResult {
  progress: StudentProgressDTO[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isUsingMockData: boolean
}

const MOCK_PROGRESS: StudentProgressDTO[] = [
  { 
    student_id: 1, 
    student_name: 'Ahmed Mohamed', 
    course_name: 'Advanced Robotics',
    current_level: 3, 
    total_levels: 5,
    completion_pct: 67, 
    sessions_attended: 24,
    sessions_total: 36
  },
  { 
    student_id: 2, 
    student_name: 'Fatima Ali', 
    course_name: 'Basic Programming',
    current_level: 2, 
    total_levels: 4,
    completion_pct: 60, 
    sessions_attended: 18,
    sessions_total: 30
  },
  { 
    student_id: 3, 
    student_name: 'Omar Hassan', 
    course_name: 'Advanced Robotics',
    current_level: 4, 
    total_levels: 5,
    completion_pct: 83, 
    sessions_attended: 30,
    sessions_total: 36
  },
  { 
    student_id: 4, 
    student_name: 'Sarah Ahmed', 
    course_name: 'Mechanical Design',
    current_level: 3, 
    total_levels: 5,
    completion_pct: 58, 
    sessions_attended: 21,
    sessions_total: 36
  },
  { 
    student_id: 5, 
    student_name: 'Mohamed Ali', 
    course_name: 'Electronics Basics',
    current_level: 3, 
    total_levels: 4,
    completion_pct: 75, 
    sessions_attended: 27,
    sessions_total: 36
  },
]

export function useStudentProgress(fallbackToMock = true): UseStudentProgressResult {
  const [progress, setProgress] = useState<StudentProgressDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const data = await getStudentProgress()
      setProgress(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch student progress')
      setError(errorObj)
      
      if (fallbackToMock) {
        setProgress(MOCK_PROGRESS)
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
    progress,
    isLoading,
    error,
    refetch: fetchData,
    isUsingMockData
  }
}
