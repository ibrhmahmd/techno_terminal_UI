// Notification Templates Hooks
// React Query hooks for template CRUD operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  testTemplate,
  type CreateTemplateRequest,
  type UpdateTemplateRequest,
  type TemplateTestRequest,
} from '../../api/notifications'
import { notificationKeys } from './queryKeys'

/**
 * Hook to fetch all notification templates
 */
export function useNotificationTemplates() {
  return useQuery({
    queryKey: notificationKeys.templates.list(),
    queryFn: getTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes - templates don't change often
  })
}

/**
 * Hook to fetch a single template by ID
 */
export function useNotificationTemplate(id: number) {
  return useQuery({
    queryKey: notificationKeys.templates.detail(id),
    queryFn: () => getTemplate(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to create a new notification template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: CreateTemplateRequest) => createTemplate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.all })
    },
  })
}

/**
 * Hook to update an existing notification template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateTemplateRequest }) =>
      updateTemplate(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.all })
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.detail(id) })
    },
  })
}

/**
 * Hook to delete a notification template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.all })
    },
  })
}

/**
 * Hook to send a test notification using a template
 */
export function useTestTemplate() {
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: TemplateTestRequest }) =>
      testTemplate(id, request),
  })
}
