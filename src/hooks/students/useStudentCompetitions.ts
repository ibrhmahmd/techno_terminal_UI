import { useQuery } from '@tanstack/react-query'
import { getStudentCompetitions } from '../../api/crm'
import { queryKeys } from '../queryKeys'

// Lazy loading hook - only fetches when enabled (tab is active)
export function useStudentCompetitions(studentId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.studentCompetitions(studentId),
    queryFn: () => getStudentCompetitions(studentId),
    enabled, // Only fetch when tab is active
    staleTime: 5 * 60 * 1000,
  })
}
