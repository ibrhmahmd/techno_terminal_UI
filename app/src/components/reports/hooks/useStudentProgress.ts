import { useState, useEffect, useCallback } from 'react'
import { getStudentProgressReport, type StudentProgressReport } from '../../../api/reports'

interface UseStudentProgressResult {
  progress: StudentProgressReport[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  isUsingMockData: boolean
}

const MOCK_PROGRESS: StudentProgressReport[] = [
  { 
    student_id: '1', 
    student_name: 'Ahmed Mohamed', 
    current_level: 3, 
    modules_completed: 8, 
    total_modules: 12, 
    progress_percentage: 67, 
    average_score: 85 
  },
  { 
    student_id: '2', 
    student_name: 'Fatima Ali', 
    current_level: 2, 
    modules_completed: 5, 
    total_modules: 10, 
    progress_percentage: 50, 
    average_score: 78 
  },
  { 
    student_id: '3', 
    student_name: 'Omar Hassan', 
    current_level: 4, 
    modules_completed: 10, 
    total_modules: 12, 
    progress_percentage: 83, 
    average_score: 92 
  },
  { 
    student_id: '4', 
    student_name: 'Aisha Ibrahim', 
    current_level: 1, 
    modules_completed: 2, 
    total_modules: 8, 
    progress_percentage: 25, 
    average_score: 72 
  },
  { 
    student_id: '5', 
    student_name: 'Mohamed Ali', 
    current_level: 3, 
    modules_completed: 9, 
    total_modules: 12, 
    progress_percentage: 75, 
    average_score: 88 
  },
]

export function useStudentProgress(fallbackToMock = true): UseStudentProgressResult {
  const [progress, setProgress] = useState<StudentProgressReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      const data = await getStudentProgressReport()
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
