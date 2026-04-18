import { useQuery } from '@tanstack/react-query'
import { getStudentTeams } from '../../api/crm'

// Lazy loading hook - only fetches when enabled (tab is active)
export function useStudentTeams(studentId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['student', studentId, 'teams'],
    queryFn: () => getStudentTeams(studentId),
    enabled, // Only fetch when tab is active
    staleTime: 5 * 60 * 1000,
  })
}
