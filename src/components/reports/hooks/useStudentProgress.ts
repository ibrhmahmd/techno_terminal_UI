import { useState, useEffect, useCallback } from 'react'
import { getStudentProgress, type StudentProgressDTO } from '../../../api/analytics'

interface UseStudentProgressResult {
  progress: StudentProgressDTO[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useStudentProgress(): UseStudentProgressResult {
  const [progress, setProgress] = useState<StudentProgressDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getStudentProgress()
      setProgress(data)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch student progress')
      setError(errorObj)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    progress,
    isLoading,
    error,
    refetch: fetchData
  }
}
