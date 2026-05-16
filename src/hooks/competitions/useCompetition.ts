import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCompetition, 
  updateCompetition,
  deleteCompetition,
  restoreCompetition,
  type Competition,
  type UpdateCompetitionInput 
} from '../../api/competitions'
import { queryKeys } from '../queryKeys'

interface UseCompetitionReturn {
  competition: Competition | null
  isLoading: boolean
  isMutating: boolean
  error: string | null
  refresh: () => Promise<void>
  update: (data: UpdateCompetitionInput) => Promise<void>
  remove: () => Promise<void>
  restore: () => Promise<void>
}

export function useCompetition(id: number | string): UseCompetitionReturn {
  const queryClient = useQueryClient()
  const numericId = typeof id === 'string' ? (id ? parseInt(id, 10) : 0) : id
  const isEnabled = !!numericId

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.competition(numericId),
    queryFn: async () => {
      const result = await getCompetition(numericId)
      return result
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  })

  const invalidateRelated = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.competitions })
    await queryClient.invalidateQueries({ queryKey: queryKeys.competitionDeleted })
    await queryClient.invalidateQueries({ queryKey: queryKeys.competition(numericId) })
  }

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCompetitionInput) => {
      return updateCompetition(numericId, data)
    },
    onSuccess: async () => {
      await invalidateRelated()
    },
    retry: 0,
  })

  const removeMutation = useMutation({
    mutationFn: async () => {
      await deleteCompetition(numericId)
    },
    onSuccess: async () => {
      await invalidateRelated()
    },
    retry: 0,
  })

  const restoreMutation = useMutation({
    mutationFn: async () => {
      await restoreCompetition(numericId)
    },
    onSuccess: async () => {
      await invalidateRelated()
    },
    retry: 0,
  })

  return {
    competition: data || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
    update: async (data: UpdateCompetitionInput) => { await updateMutation.mutateAsync(data) },
    remove: removeMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isMutating: updateMutation.isPending || removeMutation.isPending || restoreMutation.isPending,
  }
}
