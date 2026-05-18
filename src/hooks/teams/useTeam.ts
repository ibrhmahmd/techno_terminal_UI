import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeam,
  updateTeam,
  deleteTeam,
  type TeamDTO,
  type UpdateTeamInput,
} from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamReturn {
  team: TeamDTO | null
  isLoading: boolean
  error: string | null
  update: (data: UpdateTeamInput) => Promise<TeamDTO>
  remove: () => Promise<boolean>
  refresh: () => Promise<void>
}

export function useTeam(teamId: number | string): UseTeamReturn {
  const numericId = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.team(numericId),
    queryFn: async () => {
      if (isNaN(numericId)) {
        throw new Error('Invalid team ID')
      }
      return getTeam(numericId)
    },
    staleTime: 3 * 60 * 1000,
    enabled: !isNaN(numericId),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTeamInput) => updateTeam(numericId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTeam(numericId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
    },
  })

  return {
    team: data || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    refresh: async () => { await refetch() },
  }
}
