import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import {
  addExtraSession,
  deleteSession,
  cancelSession,
  reactivateSession,
} from '../api/academics/sessions/core'
import type { AddExtraSessionInput } from '../api/academics/types/sessions/inputs'

export function useSessionMutations(groupId: number) {
  const queryClient = useQueryClient()

  const invalidateSessionQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.groupSessions(groupId) })
  }

  const addSessionMutation = useMutation({
    mutationFn: (data: AddExtraSessionInput) => addExtraSession(data),
    onSuccess: () => invalidateSessionQueries(),
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => deleteSession(sessionId),
    onSuccess: () => invalidateSessionQueries(),
  })

  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId: number) => cancelSession(sessionId),
    onSuccess: () => invalidateSessionQueries(),
  })

  const reactivateSessionMutation = useMutation({
    mutationFn: (sessionId: number) => reactivateSession(sessionId),
    onSuccess: () => invalidateSessionQueries(),
  })

  return {
    addSession: addSessionMutation.mutateAsync,
    isAddingSession: addSessionMutation.isPending,
    
    deleteSession: deleteSessionMutation.mutateAsync,
    isDeletingSession: deleteSessionMutation.isPending,
    
    cancelSession: cancelSessionMutation.mutateAsync,
    isCancelingSession: cancelSessionMutation.isPending,
    
    reactivateSession: reactivateSessionMutation.mutateAsync,
    isReactivatingSession: reactivateSessionMutation.isPending,
  }
}
