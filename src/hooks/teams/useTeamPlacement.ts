import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlacement, type PlacementUpdateInput, type TeamDTO } from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamPlacementReturn {
  update: (data: PlacementUpdateInput) => Promise<TeamDTO>
  isUpdating: boolean
  error: string | null
}

export function useTeamPlacement(teamId: number | string): UseTeamPlacementReturn {
  const numericId = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: PlacementUpdateInput) => updatePlacement(numericId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
      queryClient.invalidateQueries({ queryKey: ['teams', 'by-competition'] })
    },
  })

  return {
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}
