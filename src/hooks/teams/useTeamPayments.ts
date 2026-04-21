import { useMutation, useQueryClient } from '@tanstack/react-query'
import { payCompetitionFee, type PayCompetitionFeeInput, type PayCompetitionFeeResponseDTO } from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamPaymentsReturn {
  pay: (data: PayCompetitionFeeInput) => Promise<PayCompetitionFeeResponseDTO>
  isPaying: boolean
  error: string | null
}

export function useTeamPayments(teamId: number | string): UseTeamPaymentsReturn {
  const numericId = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: PayCompetitionFeeInput) => payCompetitionFee(numericId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers(numericId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
    },
  })

  return {
    pay: mutation.mutateAsync,
    isPaying: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}
