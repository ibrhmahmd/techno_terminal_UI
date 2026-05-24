import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  type TeamMemberRosterDTO,
  type AddTeamMemberInput,
  type AddTeamMemberResultDTO,
} from '../../api/teams'
import { queryKeys } from '../queryKeys'

interface UseTeamMembersReturn {
  members: TeamMemberRosterDTO[]
  teamName: string
  isLoading: boolean
  error: string | null
  add: (data: AddTeamMemberInput) => Promise<AddTeamMemberResultDTO>
  remove: (studentId: number) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useTeamMembers(teamId: number | string): UseTeamMembersReturn {
  const numericId = typeof teamId === 'string' ? parseInt(teamId, 10) : teamId
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.teamMembers(numericId),
    queryFn: async () => {
      if (isNaN(numericId)) {
        throw new Error('Invalid team ID')
      }
      return getTeamMembers(numericId)
    },
    staleTime: 3 * 60 * 1000,
    enabled: !isNaN(numericId),
  })

  const invalidateRelated = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers(numericId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.team(numericId) })
    queryClient.invalidateQueries({ queryKey: ['teams', 'by-competition'] })
  }

  const addMutation = useMutation({
    mutationFn: (data: AddTeamMemberInput) => addTeamMember(numericId, data),
    onSuccess: () => { invalidateRelated() },
  })

  const removeMutation = useMutation({
    mutationFn: (studentId: number) => removeTeamMember(numericId, studentId),
    onSuccess: () => { invalidateRelated() },
  })

  return {
    members: data?.members || [],
    teamName: data?.team_name || '',
    isLoading,
    error: error instanceof Error ? error.message : null,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    refresh: async () => { await refetch() },
  }
}
