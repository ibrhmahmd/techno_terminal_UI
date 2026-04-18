import { useQuery } from '@tanstack/react-query'
import { getStudentCompetitions } from '../../api/crm'

// Lazy loading hook - only fetches when enabled (tab is active)
export function useStudentCompetitions(studentId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['student', studentId, 'competitions'],
    queryFn: () => getStudentCompetitions(studentId),
    enabled, // Only fetch when tab is active
    staleTime: 5 * 60 * 1000,
  })
}
