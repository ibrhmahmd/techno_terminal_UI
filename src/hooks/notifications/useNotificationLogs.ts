// Notification Logs Hooks
// React Query hooks for notification history and audit logs

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLogs,
  getLog,
  getLogRecipients,
  retryFailed,
  type NotificationLogFilters,
} from '../../api/notifications'
import { notificationKeys } from './queryKeys'

/**
 * Hook to fetch notification logs with optional filters
 */
export function useNotificationLogs(filters?: NotificationLogFilters) {
  return useQuery({
    queryKey: notificationKeys.logs.list(filters),
    queryFn: () => getLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - logs change frequently
  })
}

/**
 * Hook to fetch detailed information about a specific log
 */
export function useNotificationLog(id: number) {
  return useQuery({
    queryKey: notificationKeys.logs.detail(id),
    queryFn: () => getLog(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch recipients for a specific log
 */
export function useLogRecipients(logId: number) {
  return useQuery({
    queryKey: notificationKeys.logs.recipients(logId),
    queryFn: () => getLogRecipients(logId),
    enabled: !!logId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to retry failed notifications from a log
 */
export function useRetryFailed() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (logId: number) => retryFailed(logId),
    onSuccess: () => {
      // Invalidate all logs since retry affects multiple records
      queryClient.invalidateQueries({ queryKey: notificationKeys.logs.all })
    },
  })
}
