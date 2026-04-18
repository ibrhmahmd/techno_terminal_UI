import { useQuery } from '@tanstack/react-query'
import { getStudentCourses } from '../../api/crm'

// Lazy loading hook - only fetches when enabled (tab is active)
export function useStudentCourses(studentId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['student', studentId, 'courses'],
    queryFn: () => getStudentCourses(studentId),
    enabled, // Only fetch when tab is active
    staleTime: 5 * 60 * 1000,
  })
}
