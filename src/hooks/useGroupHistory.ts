import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getEnrollmentHistory, getInstructorHistory } from '../api/academics/groups/newEndpoints'

export function useGroupHistory(groupId: number, enabled = true) {
  const {
    data: enrollmentHistory,
    isLoading: isLoadingEnrollments,
    error: rawEnrollmentError
  } = useQuery({
    queryKey: queryKeys.groupEnrollmentHistory(groupId),
    queryFn: () => getEnrollmentHistory(groupId),
    enabled: groupId > 0 && enabled,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: instructorHistory,
    isLoading: isLoadingInstructors,
    error: rawInstructorError
  } = useQuery({
    queryKey: queryKeys.groupInstructorHistory(groupId),
    queryFn: () => getInstructorHistory(groupId),
    enabled: groupId > 0 && enabled,
    staleTime: 5 * 60 * 1000,
  })

  return {
    enrollmentHistory,
    instructorHistory,
    isLoadingEnrollments,
    isLoadingInstructors,
    enrollmentError: rawEnrollmentError instanceof Error ? rawEnrollmentError.message : null,
    instructorError: rawInstructorError instanceof Error ? rawInstructorError.message : null,
  }
}
