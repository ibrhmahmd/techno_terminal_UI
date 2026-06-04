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
    await queryClient.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.groupSessions(groupId) })
  }, [queryClient, groupId])

  // Extended invalidations for mutations that also affect enrollments and payments
  const invalidateGroupsExtended = useCallback(async () => {
    await invalidateGroups()
    await queryClient.invalidateQueries({ queryKey: queryKeys.groupEnrollments(groupId) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.groupPayments(groupId) })
  }, [queryClient, groupId, invalidateGroups])

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
    onSuccess: invalidateGroupsExtended,
  })

  // Create new level mutation (full overrides)
  const createLevelMutation = useMutation({
    mutationFn: async (data: ProgressGroupLevelRequest): Promise<ProgressGroupLevelResult> => {
      return progressGroupLevel(groupId, data)
    },
    onSuccess: invalidateGroupsExtended,
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
  const getErrorMessage = (err: unknown): string | null => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return null
  }
  const error =
    updateMutation.isError ? getErrorMessage(updateMutation.error) :
    deleteMutation.isError ? getErrorMessage(deleteMutation.error) :
    archiveMutation.isError ? getErrorMessage(archiveMutation.error) :
    levelUpMutation.isError ? getErrorMessage(levelUpMutation.error) :
    createLevelMutation.isError ? getErrorMessage(createLevelMutation.error) :
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
