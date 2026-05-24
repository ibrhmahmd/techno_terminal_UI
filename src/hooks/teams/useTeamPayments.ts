import { useMutation, useQueryClient } from '@tanstack/react-query'
import { payCompetitionFee, type PayCompetitionFeeInput, type PayCompetitionFeeResponseDTO } from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamPaymentsReturn {
  pay: (studentId: number, data: PayCompetitionFeeInput) => Promise<PayCompetitionFeeResponseDTO>
  isPaying: boolean
  error: string | null
}

export function useTeamPayments(teamId: number | string): UseTeamPaymentsReturn {
  const numericId = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: PayCompetitionFeeInput }) =>
      payCompetitionFee(numericId, studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers(numericId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
      queryClient.invalidateQueries({ queryKey: ['teams', 'by-competition'] })
    },
  })

  return {
    pay: async (studentId: number, data: PayCompetitionFeeInput) =>
      mutation.mutateAsync({ studentId, data }),
    isPaying: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}
