// Additional Recipients Hooks
// React Query hooks for managing additional email recipients

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdditionalRecipients,
  addRecipient,
  updateRecipient,
  deleteRecipient,
  type AddRecipientRequest,
  type UpdateRecipientRequest,
} from '../../api/notifications'
import { notificationKeys } from './queryKeys'

/**
 * Hook to fetch all additional recipients for the current admin
 */
export function useAdditionalRecipients() {
  return useQuery({
    queryKey: notificationKeys.admin.recipients(),
    queryFn: getAdditionalRecipients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

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

/**
 * Hook to toggle recipient active status
 * Convenience wrapper around useUpdateRecipient
 */
export function useToggleRecipientStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateRecipient(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.recipients() })
    },
  })
}
