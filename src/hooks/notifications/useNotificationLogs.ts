// Notification Logs Hooks
// React Query hooks for notification history and audit logs

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLogs,
  retryFailed,
  type NotificationLogFilters,
} from '../../api/notifications'
import { queryKeys } from '../queryKeys'
const notificationKeys = queryKeys.notifications

/**
 * Hook to fetch notification logs with optional filters
 */
export function useNotificationLogs(filters?: NotificationLogFilters) {
  return useQuery({
    queryKey: notificationKeys.logs.list(filters),
    queryFn: () => getLogs(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
