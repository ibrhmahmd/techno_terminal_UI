import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCompetition, 
  updateCompetition,
  deleteCompetition,
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
  remove: () => Promise<boolean>
}

export function useCompetition(id: number | string): UseCompetitionReturn {
  const queryClient = useQueryClient()
  const numericId = typeof id === 'string' ? (id ? parseInt(id, 10) : 0) : id
  const isEnabled = !!numericId

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.competition(numericId),
    queryFn: async () => getCompetition(numericId),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  })

  const invalidateRelated = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.competitions })
    await queryClient.invalidateQueries({ queryKey: queryKeys.competition(numericId) })
  }

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCompetitionInput) => updateCompetition(numericId, data),
    onSuccess: async () => { invalidateRelated() },
    retry: 0,
  })

  const removeMutation = useMutation({
    mutationFn: async () => deleteCompetition(numericId),
    onSuccess: async () => { invalidateRelated() },
    retry: 0,
  })

  return {
    competition: data || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: async () => { await refetch() },
    update: async (data: UpdateCompetitionInput) => { await updateMutation.mutateAsync(data) },
    remove: removeMutation.mutateAsync,
    isMutating: updateMutation.isPending || removeMutation.isPending,
  }
}
