// Notifications Hooks barrel export
// React Query hooks for notifications API

import { queryKeys } from '../queryKeys'
const notificationKeys = queryKeys.notifications

export { notificationKeys }

// Admin Settings
export {
  useAdminSettings,
} from './useAdminSettings'

// Additional Recipients
export {
  useAddRecipient,
  useUpdateRecipient,
  useDeleteRecipient,
} from './useAdditionalRecipients'

// Logs
export {
  useNotificationLogs,
  useRetryFailed,
} from './useNotificationLogs'
