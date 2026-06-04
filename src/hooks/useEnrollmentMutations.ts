import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEnrollment } from '../api/enrollments'
import type { UpdateEnrollmentRequest } from '../api/enrollments/types'

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: number, data: UpdateEnrollmentRequest }) => 
      updateEnrollment(enrollmentId, data),
    onSuccess: () => {
      // Invalidate all enrollment-related caches
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'student-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
}
