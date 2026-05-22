import { useQuery } from '@tanstack/react-query'
import { getStudentProgress, type StudentProgressDTO } from '../../../api/analytics'
import { queryKeys } from '../../../hooks/queryKeys'

interface UseStudentProgressResult {
  progress: StudentProgressDTO[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useStudentProgress(): UseStudentProgressResult {
  const { data, isLoading, error, refetch } = useQuery<StudentProgressDTO[]>({
    queryKey: queryKeys.reports.studentProgress,
    queryFn: () => getStudentProgress(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    progress: data ?? [],
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  }
}
