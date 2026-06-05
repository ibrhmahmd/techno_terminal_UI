import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  payCompetitionFee,
  refundCompetitionFee,
  type PayCompetitionFeeInput,
  type PayCompetitionFeeResponseDTO,
  type RefundCompetitionFeeInput,
} from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamPaymentsReturn {
  pay: (studentId: number, data: PayCompetitionFeeInput) => Promise<PayCompetitionFeeResponseDTO>
  isPaying: boolean
  payError: string | null
  refund: (studentId: number, data: RefundCompetitionFeeInput) => Promise<boolean>
  isRefunding: boolean
  refundError: string | null
}

export function useTeamPayments(teamId: number | string): UseTeamPaymentsReturn {
  const numericId = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  const queryClient = useQueryClient()

  const payMutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: PayCompetitionFeeInput }) =>
      payCompetitionFee(numericId, studentId, data),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers(numericId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
      queryClient.invalidateQueries({ queryKey: ['teams', 'by-competition'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentCompetitions(studentId) })
    },
  })

  const refundMutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: RefundCompetitionFeeInput }) =>
      refundCompetitionFee(numericId, studentId, data),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers(numericId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
      queryClient.invalidateQueries({ queryKey: ['teams', 'by-competition'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.studentCompetitions(studentId) })
    },
  })

  return {
    pay: async (studentId: number, data: PayCompetitionFeeInput) =>
      payMutation.mutateAsync({ studentId, data }),
    isPaying: payMutation.isPending,
    payError: payMutation.error instanceof Error ? payMutation.error.message : null,
    refund: async (studentId: number, data: RefundCompetitionFeeInput) =>
      refundMutation.mutateAsync({ studentId, data }),
    isRefunding: refundMutation.isPending,
    refundError: refundMutation.error instanceof Error ? refundMutation.error.message : null,
  }
}
