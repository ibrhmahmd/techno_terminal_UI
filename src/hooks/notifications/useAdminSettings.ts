// Admin Settings Hooks
// React Query hooks for admin notification preferences

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminSettings,
  updateAdminSettings,
  getNotificationSetting,
  toggleNotification,
  type UpdateAdminSettingsRequest,
  type NotificationType,
} from '../../api/notifications'
import { notificationKeys } from './queryKeys'

/**
 * Hook to fetch all admin notification settings and additional recipients
 */
export function useAdminSettings() {
  return useQuery({
    queryKey: notificationKeys.admin.settings(),
    queryFn: getAdminSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single notification type setting
 */
export function useNotificationSetting(notificationType: NotificationType) {
  return useQuery({
    queryKey: notificationKeys.admin.setting(notificationType),
    queryFn: () => getNotificationSetting(notificationType),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to bulk update admin notification settings
 */
export function useUpdateAdminSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: UpdateAdminSettingsRequest) => updateAdminSettings(request),
    onSuccess: () => {
      // Invalidate all admin settings queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.all })
    },
  })
}

/**
 * Hook to toggle a single notification type on/off
 */
export function useToggleNotification(notificationType: NotificationType) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (isEnabled: boolean) => 
      toggleNotification(notificationType, { is_enabled: isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.all })
    },
  })
}

/**
 * Hook to batch toggle multiple notification types
 * Useful for bulk enable/disable operations
 */
export function useBatchToggleNotifications() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: { type: NotificationType; isEnabled: boolean }[]) => {
      const results = await Promise.all(
        updates.map(({ type, isEnabled }) =>
          toggleNotification(type, { is_enabled: isEnabled })
        )
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.admin.all })
    },
  })
}
