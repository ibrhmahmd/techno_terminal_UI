import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateGroup,
  deleteGroup,
  archiveGroup,
  progressGroupLevel,
  type Group,
  type UpdateGroupDTO,
  type ProgressGroupLevelRequest,
  type ProgressGroupLevelResult,
} from '../api/academics'
import { queryKeys } from './queryKeys'

type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseGroupMutationsReturn {
  updateGroup: (data: UpdateGroupDTO) => Promise<Group>
  deleteGroup: () => Promise<void>
  archiveGroup: () => Promise<Group>
  levelUp: () => Promise<ProgressGroupLevelResult>
  createNewLevel: (data: ProgressGroupLevelRequest) => Promise<ProgressGroupLevelResult>
  status: MutationStatus
  error: string | null
  clearError: () => void
}

export function useGroupMutations(groupId: number): UseGroupMutationsReturn {
  const queryClient = useQueryClient()

  // Invalidate groups cache helper
  const invalidateGroups = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
    await queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
  }, [queryClient, groupId])

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

  // Level up mutation (simple - no overrides)
  const levelUpMutation = useMutation({
    mutationFn: async (): Promise<ProgressGroupLevelResult> => {
      return progressGroupLevel(groupId)
    },
    onSuccess: invalidateGroups,
  })

  // Create new level mutation (full overrides)
  const createLevelMutation = useMutation({
    mutationFn: async (data: ProgressGroupLevelRequest): Promise<ProgressGroupLevelResult> => {
      return progressGroupLevel(groupId, data)
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
  const clearError = useCallback(() => {
    updateMutation.reset()
    deleteMutation.reset()
    archiveMutation.reset()
    levelUpMutation.reset()
    createLevelMutation.reset()
  }, [updateMutation, deleteMutation, archiveMutation, levelUpMutation, createLevelMutation])

  // Wrapper functions that maintain the same interface — wrapped in useCallback for stable references
  const handleUpdateGroup = useCallback(async (data: UpdateGroupDTO): Promise<Group> => {
    return updateMutation.mutateAsync(data)
  }, [updateMutation])

  const handleDeleteGroup = useCallback(async (): Promise<void> => {
    return deleteMutation.mutateAsync()
  }, [deleteMutation])

  const handleArchiveGroup = useCallback(async (): Promise<Group> => {
    return archiveMutation.mutateAsync()
  }, [archiveMutation])

  const handleLevelUp = useCallback(async (): Promise<ProgressGroupLevelResult> => {
    return levelUpMutation.mutateAsync()
  }, [levelUpMutation])

  const handleCreateNewLevel = useCallback(async (data: ProgressGroupLevelRequest): Promise<ProgressGroupLevelResult> => {
    return createLevelMutation.mutateAsync(data)
  }, [createLevelMutation])

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
