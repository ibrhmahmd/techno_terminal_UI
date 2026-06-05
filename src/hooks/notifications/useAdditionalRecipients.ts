// Additional Recipients Hooks
// React Query hooks for managing additional email recipients

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addRecipient,
  updateRecipient,
  deleteRecipient,
  type AddRecipientRequest,
  type UpdateRecipientRequest,
} from '../../api/notifications'
import { queryKeys } from '../queryKeys'
const notificationKeys = queryKeys.notifications

/**
 * Hook to add a new additional recipient
 */
export function useAddRecipient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: AddRecipientRequest) => addRecipient(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.recipients() })
    },
  })
}

/**
 * Hook to update an existing recipient
 */
export function useUpdateRecipient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateRecipientRequest }) =>
      updateRecipient(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.recipients() })
    },
  })
}

/**
 * Hook to delete a recipient
 */
export function useDeleteRecipient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deleteRecipient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.recipients() })
    },
  })
}


