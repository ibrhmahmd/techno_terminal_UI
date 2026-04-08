import { useState, useCallback } from 'react'
import {
  updateGroup,
  deleteGroup,
  archiveGroup,
  levelUpGroup,
  createNewLevel,
  type Group,
  type UpdateGroupDTO,
  type CreateNewLevelInput,
  type GroupLevelHistoryDTO,
} from '../api/academics'

type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseGroupMutationsReturn {
  updateGroup: (data: UpdateGroupDTO) => Promise<Group>
  deleteGroup: () => Promise<void>
  archiveGroup: () => Promise<Group>
  levelUp: () => Promise<Group>
  createNewLevel: (data: CreateNewLevelInput) => Promise<GroupLevelHistoryDTO>
  status: MutationStatus
  error: string | null
  clearError: () => void
}

export function useGroupMutations(groupId: number): UseGroupMutationsReturn {
  const [status, setStatus] = useState<MutationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
    setStatus('idle')
  }, [])

  const handleUpdateGroup = useCallback(
    async (data: UpdateGroupDTO): Promise<Group> => {
      setStatus('loading')
      setError(null)
      try {
        const result = await updateGroup(groupId, data)
        setStatus('success')
        return result
      } catch (err: any) {
        const message = err.message || 'Failed to update group'
        setError(message)
        setStatus('error')
        throw err
      }
    },
    [groupId],
  )

  const handleDeleteGroup = useCallback(async (): Promise<void> => {
    setStatus('loading')
    setError(null)
    try {
      await deleteGroup(groupId)
      setStatus('success')
    } catch (err: any) {
      const message = err.message || 'Failed to delete group'
      setError(message)
      setStatus('error')
      throw err
    }
  }, [groupId])

  const handleArchiveGroup = useCallback(async (): Promise<Group> => {
    setStatus('loading')
    setError(null)
    try {
      const result = await archiveGroup(groupId)
      setStatus('success')
      return result
    } catch (err: any) {
      const message = err.message || 'Failed to archive group'
      setError(message)
      setStatus('error')
      throw err
    }
  }, [groupId])

  const handleLevelUp = useCallback(async (): Promise<Group> => {
    setStatus('loading')
    setError(null)
    try {
      const result = await levelUpGroup(groupId)
      setStatus('success')
      return result
    } catch (err: any) {
      const message = err.message || 'Failed to level up group'
      setError(message)
      setStatus('error')
      throw err
    }
  }, [groupId])

  const handleCreateNewLevel = useCallback(async (data: CreateNewLevelInput): Promise<GroupLevelHistoryDTO> => {
    setStatus('loading')
    setError(null)
    try {
      const result = await createNewLevel(groupId, data)
      setStatus('success')
      return result
    } catch (err: any) {
      const message = err.message || 'Failed to create new level'
      setError(message)
      setStatus('error')
      throw err
    }
  }, [groupId])

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
