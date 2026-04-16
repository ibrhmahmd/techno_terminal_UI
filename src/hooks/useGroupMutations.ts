import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateGroup,
  deleteGroup,
  archiveGroup,
  levelUpGroup,
  scheduleGroupLevel,
  type Group,
  type UpdateGroupDTO,
  type ScheduleGroupLevelInput,
  type ScheduleGroupLevelResponse,
} from '../api/academics'
import { queryKeys } from './queryKeys'

type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseGroupMutationsReturn {
  updateGroup: (data: UpdateGroupDTO) => Promise<Group>
  deleteGroup: () => Promise<void>
  archiveGroup: () => Promise<Group>
  levelUp: () => Promise<Group>
  createNewLevel: (data: ScheduleGroupLevelInput) => Promise<ScheduleGroupLevelResponse>
  status: MutationStatus
  error: string | null
  clearError: () => void
}

export function useGroupMutations(groupId: number): UseGroupMutationsReturn {
  const queryClient = useQueryClient()

  // Invalidate groups cache helper
  const invalidateGroups = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
    await queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
  }

  // Update group mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateGroupDTO): Promise<Group> => {
      return updateGroup(groupId, data)
    },
    onSuccess: invalidateGroups,
  })

  // Delete group mutation
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      return deleteGroup(groupId)
    },
    onSuccess: invalidateGroups,
  })

  // Archive group mutation
  const archiveMutation = useMutation({
    mutationFn: async (): Promise<Group> => {
      return archiveGroup(groupId)
    },
    onSuccess: invalidateGroups,
  })

  // Level up mutation
  const levelUpMutation = useMutation({
    mutationFn: async (): Promise<Group> => {
      return levelUpGroup(groupId)
    },
    onSuccess: invalidateGroups,
  })

  // Create new level mutation
  const createLevelMutation = useMutation({
    mutationFn: async (data: ScheduleGroupLevelInput): Promise<ScheduleGroupLevelResponse> => {
      return scheduleGroupLevel(groupId, data)
    },
    onSuccess: invalidateGroups,
  })

  // Combine all pending states
  const isPending = 
    updateMutation.isPending || 
    deleteMutation.isPending || 
    archiveMutation.isPending || 
    levelUpMutation.isPending || 
    createLevelMutation.isPending

  // Determine overall status
  let status: MutationStatus = 'idle'
  if (isPending) status = 'loading'
  else if (updateMutation.isSuccess || deleteMutation.isSuccess || archiveMutation.isSuccess || levelUpMutation.isSuccess || createLevelMutation.isSuccess) status = 'success'
  else if (updateMutation.isError || deleteMutation.isError || archiveMutation.isError || levelUpMutation.isError || createLevelMutation.isError) status = 'error'

  // Combine all errors
  const error = 
    (updateMutation.error as Error)?.message ||
    (deleteMutation.error as Error)?.message ||
    (archiveMutation.error as Error)?.message ||
    (levelUpMutation.error as Error)?.message ||
    (createLevelMutation.error as Error)?.message ||
    null

  // Clear all mutations
  const clearError = () => {
    updateMutation.reset()
    deleteMutation.reset()
    archiveMutation.reset()
    levelUpMutation.reset()
    createLevelMutation.reset()
  }

  // Wrapper functions that maintain the same interface
  const handleUpdateGroup = async (data: UpdateGroupDTO): Promise<Group> => {
    return updateMutation.mutateAsync(data)
  }

  const handleDeleteGroup = async (): Promise<void> => {
    return deleteMutation.mutateAsync()
  }

  const handleArchiveGroup = async (): Promise<Group> => {
    return archiveMutation.mutateAsync()
  }

  const handleLevelUp = async (): Promise<Group> => {
    return levelUpMutation.mutateAsync()
  }

  const handleCreateNewLevel = async (data: ScheduleGroupLevelInput): Promise<ScheduleGroupLevelResponse> => {
    return createLevelMutation.mutateAsync(data)
  }

  return {
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    archiveGroup: handleArchiveGroup,
    levelUp: handleLevelUp,
    createNewLevel: handleCreateNewLevel,
    status,
    error,
    clearError,
  }
}
