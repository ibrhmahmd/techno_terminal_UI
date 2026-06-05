// Admin Settings Hooks
// React Query hooks for admin notification preferences

import { useQuery } from '@tanstack/react-query'
import { getAdminSettings } from '../../api/notifications'
import { queryKeys } from '../queryKeys'
const notificationKeys = queryKeys.notifications

/**
 * Hook to fetch all admin notification settings and additional recipients
 */
export function useAdminSettings() {
  return useQuery({
    queryKey: notificationKeys.admin.settings(),
    queryFn: getAdminSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}



